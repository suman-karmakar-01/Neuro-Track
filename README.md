# Neuro-Track 🧠🩺
### Student Health & Wellness Telemetry System

**Neuro-Track** is a smart digital health platform designed for secondary school and college students. It helps track emotional well-being and stress levels by combining **simple self-assessment questionnaires** with **real-time wearable health telemetry** (Heart Rate, Blood Oxygen SpO₂, Body Temperature, and Sleep Monitoring).

> **Note:** The platform works **100% out of the box with or without hardware**. If no wearable band is connected, the website safely displays `"Not Applicable"` with a flatline baseline — no errors or crashes.

---

## 🚀 Quick Start Guide (Run from Scratch)

Follow these simple steps after downloading and extracting the project ZIP.

### Step 1: Prerequisites
Make sure you have **Node.js** installed on your computer.
- Download from [nodejs.org](https://nodejs.org/) (LTS version recommended).
- To check if it's installed, open Command Prompt or PowerShell and type:
  ```bash
  node -v
  npm -v
  ```

---

### Step 2: Open the Backend Folder
1. Extract the downloaded ZIP file to any folder on your computer.
2. Open your terminal (Command Prompt, PowerShell, or VS Code terminal).
3. Navigate into the `Backend` directory:
   ```bash
   cd "Backend"
   ```
   *(Or right-click inside the `Backend` folder and select **Open in Terminal**)*

---

### Step 3: Install Dependencies
Install the required packages by running:
```bash
npm install
```
*(This only needs to be run once. It takes about 10–20 seconds).*

---

### Step 4: Start the Server
Start the backend server:
```bash
npm run dev
```

You will see:
```text
Server running on http://localhost:5000
Database: Local Persistent Storage active (local_db.json)
```

---

### Step 5: Open the Website
Open your web browser (Chrome, Edge, Brave, or Firefox) and go to:
👉 **[http://localhost:5000](http://localhost:5000)**

That's it! The whole platform is live and running.

---

## 🔑 Default Login Credentials

You don't need to create accounts from scratch to test the system. Use these pre-configured accounts:

### 👤 Student / User Login
- **User ID:** `NT1001`
- **PIN:** `1234`
- *Features: View your dashboard, take the 10-question health assessment, check past reports, and monitor live wearable vitals.*

### 🛡️ Authority / Counselor Login
- **Email:** `admin@neurotech.com`
- **Password:** `admin123`
- *Features: Review newly registered students, generate their unique User IDs and PINs, and view student risk levels.*

---

## 📁 Project Structure

```text
SIH 26094/
├── Backend/                     # Node.js & Express API Server
│   ├── server.js               # Main server file (serves API & Frontend)
│   ├── firebase.js             # Database manager (Local JSON & Cloud sync)
│   ├── local_db.json           # Offline persistent database file
│   ├── login.js                # Auth routes (Student & Authority login)
│   ├── session.js              # Assessment submission & scoring logic
│   ├── wearable.js             # Telemetry ingestion & live vitals handler
│   ├── users.js                # Student profile & history routes
│   └── package.json            # Project dependencies
│
├── Frontend/                    # Clean HTML, CSS & Vanilla JS Web App
│   ├── index.html              # Landing page
│   ├── login.html              # Student login (UID + PIN)
│   ├── register.html           # New student registration
│   ├── dashboard.html          # Student home dashboard
│   ├── session-intro.html      # Assessment welcome & instructions
│   ├── session-question.html   # 10-question screening questionnaire
│   ├── session-review.html     # Answer review before submitting
│   ├── session-result.html     # Risk score, recommendations & vitals snapshot
│   ├── data-live.html          # Real-time wearable telemetry monitor
│   ├── statistics.html         # Health trends, sleep tracking & charts
│   ├── history.html            # All previous screening reports
│   ├── authority-users.html    # Authority console (student management)
│   └── style.css               # Clean responsive stylesheet
│
├── firmware/                    # ESP32 Arduino Sketch
│   └── esp32_wearable_client.ino  # Code for ESP32 + MAX30102 + DS18B20 + MPU6050
│
└── README.md                    # Project documentation
```

---

## ⌚ Hardware Setup (Optional ESP32 Band)

The wearable band connects over **Wi-Fi** and sends sensor data to the backend every 5 seconds.

### Required Components:
1. **ESP32 NodeMCU** (Microcontroller with Wi-Fi)
2. **MAX30102** (Heart rate & Blood Oxygen SpO₂)
3. **DS18B20** (Waterproof body temperature probe)
4. **MPU6050** (6-axis gyroscope / accelerometer for sleep & motion tracking)
5. **4.7 kΩ Resistor** (Pull-up resistor for DS18B20 data line)

### Pin Connection Diagram:
| Sensor | Sensor Pin | ESP32 Pin | Notes |
|:---|:---|:---|:---|
| **All Sensors** | VCC | **3V3** | Connect to 3.3V rail |
| **All Sensors** | GND | **GND** | Connect to Ground |
| **MAX30102 & MPU6050** | SDA | **GPIO 21** | I2C Data bus |
| **MAX30102 & MPU6050** | SCL | **GPIO 22** | I2C Clock bus |
| **DS18B20** | DATA | **GPIO 4** | OneWire bus (add 4.7kΩ resistor to 3V3) |

### How to Flash the ESP32:
1. Open [`firmware/esp32_wearable_client.ino`](firmware/esp32_wearable_client.ino) in the **Arduino IDE**.
2. Install required libraries from Arduino Library Manager:
   - `SparkFun MAX3010x Pulse and Proximity Sensor Library`
   - `DallasTemperature`
   - `OneWire`
   - `MPU6050` by Electronic Cats
3. In lines 17–19, enter your Wi-Fi details and computer's local IP address:
   ```cpp
   const char* ssid = "YOUR_WIFI_NAME";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* serverEndpoint = "http://192.168.X.X:5000/api/wearable/data";
   const char* targetUserId = "NT1001";
   ```
4. Connect your ESP32 via USB and click **Upload**.
5. Once powered on, it connects to your Wi-Fi and automatically streams vitals to your web dashboard!

---

## 🔒 Security & Privacy Notice

- **Educational & Screening Tool:** Neuro-Track is intended as a non-invasive preliminary wellness monitor and self-care guide. It does not replace professional medical or psychiatric diagnosis.
- **Authority Supervised Access:** Students can only log in after a verified school authority issues a unique User ID and 4-digit PIN.

---

## 👨‍💻 Developed By
- **Suman Karmakar** ([@suman-karmakar-01](https://github.com/suman-karmakar-01))
- Open-source student initiative for youth health and wellness.
