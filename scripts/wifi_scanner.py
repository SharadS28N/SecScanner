from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
from sklearn.ensemble import IsolationForest
import pywifi
import time
from netaddr import EUI
import numpy as np

app = Flask(__name__)
CORS(app)

CSV_FILE = "wifi_scans_rich.csv"

def get_vendor_oui(bssid):
    try:
        mac = EUI(bssid)
        return str(mac.oui)
    except:
        return "Unknown"

def scan_wifi_pywifi():
    wifi = pywifi.PyWiFi()
    interfaces = wifi.interfaces()
    if not interfaces:
        raise Exception("No wireless interfaces found. Please ensure your device has WiFi.")
    iface = interfaces[0]
    iface.scan()
    time.sleep(3)
    results = iface.scan_results()
    networks = []
    for network in results:
        ssid = network.ssid.strip()
        bssid = network.bssid.strip()
        signal = network.signal
        channel_freq = network.freq  # frequency in MHz
        # Convert freq to channel number (common 2.4GHz and 5GHz channels)
        if 2412 <= channel_freq <= 2472:
            channel_num = (channel_freq - 2407) // 5
        elif 5180 <= channel_freq <= 5825:
            channel_num = (channel_freq - 5000) // 5
        else:
            channel_num = 0  # Unknown channel
        vendor = get_vendor_oui(bssid)
        if ssid != "":
            networks.append({
                'SSID': ssid,
                'BSSID': bssid,
                'Signal': signal,
                'Channel': int(channel_num),
                'Vendor': vendor
            })
    return networks

def save_scan_to_csv(networks):
    if not networks:
        return
    df_new = pd.DataFrame(networks)
    if os.path.exists(CSV_FILE):
        df_old = pd.read_csv(CSV_FILE)
        df = pd.concat([df_old, df_new], ignore_index=True)
    else:
        df = df_new
    df.to_csv(CSV_FILE, index=False)

def encode_vendor(df):
    # One-hot encode vendor OUIs
    vendors = df['Vendor'].unique()
    for v in vendors:
        df[f'vendor_{v}'] = (df['Vendor'] == v).astype(int)
    df = df.drop(columns=['Vendor'])
    return df

def extract_features(df):
    # Aggregate historical features by SSID and BSSID
    df_agg = df.groupby(['SSID', 'BSSID']).agg({
        'Signal': ['mean', 'std'],
        'Channel': lambda x: x.mode().iloc[0] if not x.mode().empty else 0,
    })
    df_agg.columns = ['_'.join(col).strip() for col in df_agg.columns.values]
    df_agg = df_agg.reset_index()

    # Add Vendor from latest data
    latest_df = df.drop_duplicates(subset=['BSSID'], keep='last')
    df_agg = df_agg.merge(latest_df[['BSSID', 'Vendor']], on='BSSID', how='left')

    # One-hot encode vendor
    df_agg = encode_vendor(df_agg)

    # Fill NaNs in std with 0 (if only one sample)
    df_agg['Signal_std'] = df_agg['Signal_std'].fillna(0)

    # Add SSID length as feature
    df_agg['SSID_len'] = df_agg['SSID'].apply(len)

    # Drop non-numeric SSID and BSSID before model
    features = df_agg.drop(columns=['SSID', 'BSSID'])

    return features, df_agg

def train_model(features):
    clf = IsolationForest(contamination=0.1, random_state=42)
    clf.fit(features)
    return clf

def convert_np_types(obj):
    if isinstance(obj, dict):
        return {k: convert_np_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_np_types(i) for i in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    else:
        return obj

@app.route('/api/scan-wifi', methods=['POST'])
def scan_wifi():
    try:
        print("[INFO] Received scan request...")

        networks = scan_wifi_pywifi()
        print(f"[INFO] Found {len(networks)} networks")

        if not networks:
            return jsonify({"error": "No networks found."}), 500

        save_scan_to_csv(networks)

        df_history = pd.read_csv(CSV_FILE)
        features, df_agg = extract_features(df_history)

        model = train_model(features)
        preds = model.predict(features)
        df_agg['anomaly'] = preds  # -1 means anomaly

        results = []
        for _, row in df_agg.iterrows():
            is_suspicious = row['anomaly'] == -1
            confidence = 1.0 if is_suspicious else 0.0

            results.append({
                "ssid": row['SSID'],
                "bssid": row['BSSID'],
                "mean_signal": float(row['Signal_mean']),
                "signal_std": float(row['Signal_std']),
                "channel": int(row['Channel_<lambda>']),
                "suspicious": bool(is_suspicious),
                "confidence": float(confidence)
            })

        total_networks = int(len(df_agg))
        suspicious_count = int((df_agg['anomaly'] == -1).sum())

        print("[INFO] Scan complete. Returning results.")

        response = {
            "networks": results,
            "stats": {
                "totalNetworks": total_networks,
                "suspiciousCount": suspicious_count
            }
        }

        return jsonify(convert_np_types(response))

    except Exception as e:
        print("[ERROR] Exception occurred:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
