#!/usr/bin/env python3
"""
WiFi Scanner API - Modified version of the original script for web integration
Removes Streamlit dependencies and provides JSON output for the web interface
"""

import json
import pandas as pd
import os
import sys
from sklearn.ensemble import IsolationForest
import pywifi
import time

CSV_FILE = "wifi_scans.csv"

def scan_wifi_pywifi():
    """Scan for WiFi networks using pywifi library"""
    try:
        wifi = pywifi.PyWiFi()
        iface = wifi.interfaces()[0]
        iface.scan()
        time.sleep(3)
        results = iface.scan_results()
        networks = []
        
        for network in results:
            ssid = network.ssid.strip()
            bssid = network.bssid.strip()
            signal = network.signal
            if ssid != "":
                networks.append({'SSID': ssid, 'BSSID': bssid, 'Signal': signal})
        
        return networks
    except Exception as e:
        print(f"Error scanning WiFi: {e}", file=sys.stderr)
        return []

def save_scan_to_csv(networks):
    """Save scan results to CSV file for historical analysis"""
    if not networks:
        return
    
    df_new = pd.DataFrame(networks)
    if os.path.exists(CSV_FILE):
        df_old = pd.read_csv(CSV_FILE)
        df = pd.concat([df_old, df_new], ignore_index=True)
    else:
        df = df_new
    df.to_csv(CSV_FILE, index=False)

def extract_features(df):
    """Extract features from historical data"""
    hist_stats = df.groupby('SSID').agg({
        'BSSID': pd.Series.nunique,
        'Signal': 'mean'
    }).rename(columns={'BSSID':'hist_bssid_count', 'Signal':'hist_avg_signal'})
    return hist_stats

def prepare_current_features(networks, hist_stats):
    """Prepare features for current scan"""
    df_current = pd.DataFrame(networks)
    current_stats = df_current.groupby('SSID').agg({
        'BSSID': pd.Series.nunique,
        'Signal': 'mean'
    }).rename(columns={'BSSID':'curr_bssid_count', 'Signal':'curr_avg_signal'})
    features = hist_stats.join(current_stats, how='outer').fillna(0)
    return features

def train_model(features):
    """Train the anomaly detection model"""
    clf = IsolationForest(contamination=0.1, random_state=42)
    clf.fit(features)
    return clf

def main():
    """Main function to perform WiFi scan and analysis"""
    try:
        # Scan for networks
        networks = scan_wifi_pywifi()
        
        if not networks:
            # Return empty result if no networks found
            result = {
                "networks": [],
                "stats": {
                    "totalNetworks": 0,
                    "suspiciousCount": 0,
                    "avgSignal": 0,
                    "avgBssidCount": 0
                }
            }
            print(json.dumps(result))
            return
        
        # Save to CSV for historical analysis
        save_scan_to_csv(networks)
        
        # Load historical data and perform analysis
        if os.path.exists(CSV_FILE):
            df_history = pd.read_csv(CSV_FILE)
            hist_stats = extract_features(df_history)
            features = prepare_current_features(networks, hist_stats)
            model = train_model(features)
            predictions = model.predict(features)
            features['anomaly'] = predictions
            suspicious_ssids = features[features['anomaly'] == -1].index.tolist()
        else:
            suspicious_ssids = []
        
        # Format results for web interface
        formatted_networks = []
        for network in networks:
            is_suspicious = network['SSID'] in suspicious_ssids
            confidence = 0.85 if is_suspicious else 0.92  # Mock confidence scores
            
            formatted_networks.append({
                "ssid": network['SSID'],
                "bssid": network['BSSID'],
                "signal": network['Signal'],
                "suspicious": is_suspicious,
                "confidence": confidence
            })
        
        # Calculate statistics
        total_networks = len(formatted_networks)
        suspicious_count = len(suspicious_ssids)
        avg_signal = round(sum(n['Signal'] for n in networks) / len(networks), 1) if networks else 0
        avg_bssid_count = 1.2  # Mock value
        
        result = {
            "networks": formatted_networks,
            "stats": {
                "totalNetworks": total_networks,
                "suspiciousCount": suspicious_count,
                "avgSignal": avg_signal,
                "avgBssidCount": avg_bssid_count
            }
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": str(e),
            "networks": [],
            "stats": {
                "totalNetworks": 0,
                "suspiciousCount": 0,
                "avgSignal": 0,
                "avgBssidCount": 0
            }
        }
        print(json.dumps(error_result), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
