# SecScanner - WiFi Evil Twin Detection System

SecScanner is a full-stack AI-powered WiFi security scanner that detects **evil twin access points**—malicious wireless networks that impersonate legitimate ones to steal data. It combines a React frontend with a Flask + Scikit-learn backend and utilizes Isolation Forest anomaly detection to identify suspicious network behavior.

---

## 🧠 Features

- 🔍 **Live WiFi Scanning** using `pywifi`
- 🧠 **Machine Learning-Based Detection** with Isolation Forest
- 📊 **Real-time Network Statistics**
- ⚠️ **Suspicious Network Classification**
- 🧹 **Filters by SSID or Suspicion Level**
- 💡 **Educational Explanation Panel**
- 🌗 **Dark/Light Theme Toggle**

---

## 🛠️ Tech Stack

### Frontend
- **React** (Next.js with app directory structure)
- **TypeScript**
- **Tailwind CSS** + **ShadCN UI**
- Icons: `lucide-react`

### Backend
- **Python + Flask**
- **Scikit-learn (Isolation Forest)**
- **Pandas**
- **PyWiFi** (WiFi scanning)
- **CORS** enabled for cross-origin access

---

## 🚀 Getting Started

### 📦 Requirements

#### Frontend:
- Node.js (v16+)
- npm or yarn

#### Backend:
- Python 3.8+
- pip

---

### 📁 Project Structure

```

.
├── frontend/
│   └── pages/
│       └── index.tsx      # React client code (WiFiSecurityScanner)
├── backend/
│   └── wifi\_scanner.py    # Flask API with AI-based anomaly detection
└── wifi\_scans\_rich.csv    # Stores historical network scan data

````

---

### ⚙️ Backend Setup

```bash
cd backend
pip install -r requirements.txt
python wifi_scanner.py
````

> Required Python Packages:

```bash
flask flask-cors pandas scikit-learn pywifi netaddr numpy
```

---

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open your browser at: `http://localhost:3000`

---

## 📡 How It Works

1. **Scan WiFi Networks** using `pywifi` (signal strength, SSID, BSSID, vendor, channel).
2. **Save historical scans** to CSV (`wifi_scans_rich.csv`).
3. **Train ML Model**: Isolation Forest identifies anomalous (potentially evil twin) access points based on:

   * Signal deviation
   * Channel inconsistency
   * Vendor patterns
4. **Detect Suspicious Networks** and display them in the UI with confidence score.
5. **Filter by SSID or type (Suspicious / Normal)** in real time.

---

## 📊 Detection Logic

| Feature              | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| **Signal Strength**  | Mean and standard deviation used to detect inconsistencies |
| **Channel Analysis** | Checks for uncommon frequency changes                      |
| **BSSID Uniqueness** | Identifies duplicates across networks                      |
| **Vendor Patterns**  | Uses OUI lookups to identify vendor legitimacy             |

---

## 🔐 Evil Twin Attack?

An **evil twin attack** occurs when a malicious actor sets up a rogue WiFi AP with the same SSID as a legitimate network. This tricks users into connecting, exposing sensitive data.

This scanner aims to **proactively detect such threats** using AI and scanning.

---

## 📎 Future Improvements

* 🔐 WPA handshake analysis
* 📍 Geo-tagging of scan results
* 📚 Graph-based anomaly models
* ⏱️ Periodic background scanning

---

## 🤖 Author

Developed by: **\*SecScanner Team**

With ❤️ using open-source tools.

---

## 📃 License

MIT License