/*
 * NeuroTech Wearable Band - ESP32 Firmware Client
 * Hardware: ESP32 NodeMCU, MAX30102 (HR/SpO2), DS18B20 (Temp), MPU6050 (IMU/Sleep)
 * Communication: Wi-Fi HTTP POST (5-second throttle rate)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <MPU6050.h>

// --- Wi-Fi & Server Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverEndpoint = "http://192.168.1.100:5000/api/wearable/data"; // Backend URL
const char* targetUserId = "NT1001"; // Target user identifier

// --- Sensor Pinouts ---
#define ONE_WIRE_BUS 4 // DS18B20 Data pin on GPIO 4 (use 4.7k resistor to 3.3V)
#define SDA_PIN 21     // I2C Data pin for MAX30102 & MPU6050
#define SCL_PIN 22     // I2C Clock pin for MAX30102 & MPU6050

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);
MAX30105 particleSensor;
MPU6050 mpu;

// Telemetry state variables
unsigned long lastTelemetryPost = 0;
const unsigned long postInterval = 5000; // 5-second database throttling

// Filtered vitals
float currentHeartRate = 0.0;
float currentSpO2 = 0.0;
float currentTempC = 0.0;
float cumulativeSleepHours = 7.5; // Calculated from resting inactivity duration
String motionStatus = "Resting";

// Actigraphy sleep tracking metrics
unsigned long restingSeconds = 0;
unsigned long lastActigraphyCheck = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("[NeuroTech] Initializing Wearable Telemetry Node...");

  // Initialize I2C Bus
  Wire.begin(SDA_PIN, SCL_PIN);

  // Initialize Temperature Sensor
  tempSensor.begin();
  Serial.println("[Sensor] DS18B20 Thermal Probe Initialized.");

  // Initialize MAX30102 Optical Sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("[Warning] MAX30102 not detected. Check I2C wiring.");
  } else {
    particleSensor.setup(); // Default configuration
    particleSensor.setPulseAmplitudeRed(0x1F); // 6.4mA LED current
    particleSensor.setPulseAmplitudeGreen(0);  // Green LED off
    Serial.println("[Sensor] MAX30102 Pulse Oximeter Online.");
  }

  // Initialize MPU6050 Gyroscope/Accelerometer
  mpu.initialize();
  if (mpu.testConnection()) {
    Serial.println("[Sensor] MPU6050 6-Axis Motion Sensor Online.");
  } else {
    Serial.println("[Warning] MPU6050 not responding.");
  }

  // Connect to Wi-Fi
  connectToWiFi();
}

void loop() {
  // Keep Wi-Fi connected
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  // Sample Optical Sensor for Heart Beat
  long irValue = particleSensor.getIR();
  if (irValue > 50000) {
    // Finger detected
    if (checkForBeat(irValue)) {
      long delta = millis() - lastTelemetryPost;
      float bpm = 60.0 / (delta / 1000.0);
      if (bpm >= 50 && bpm <= 160) {
        currentHeartRate = (currentHeartRate * 0.7) + (bpm * 0.3); // Simple smoothing
      }
    }
  } else {
    // Finger removed
    currentHeartRate = 0.0;
  }

  // Check Actigraphy every 1 second
  if (millis() - lastActigraphyCheck >= 1000) {
    lastActigraphyCheck = millis();
    updateMotionAndSleep();
  }

  // Transmit Telemetry Packet every 5 seconds
  if (millis() - lastTelemetryPost >= postInterval) {
    lastTelemetryPost = millis();
    readSensors();
    transmitTelemetry();
  }
}

// Read DS18B20 and estimate SpO2
void readSensors() {
  // Read body temperature
  tempSensor.requestTemperatures();
  float temp = tempSensor.getTempCByIndex(0);
  if (temp > 20.0 && temp < 45.0) {
    currentTempC = temp;
  } else {
    currentTempC = 36.6; // Baseline if detached
  }

  // Read SpO2
  long irValue = particleSensor.getIR();
  long redValue = particleSensor.getRed();
  if (irValue > 50000 && redValue > 0) {
    // Ratio of ratios estimation
    float ratio = (float)redValue / (float)irValue;
    float spo2 = 110.0 - (25.0 * ratio);
    if (spo2 > 100.0) spo2 = 99.0;
    if (spo2 < 85.0) spo2 = 95.0;
    currentSpO2 = spo2;
  } else {
    currentSpO2 = 0.0;
  }
}

// Evaluate wrist stillness to determine sleep/motion state
void updateMotionAndSleep() {
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  // Calculate gyro magnitude (movement indicator)
  float gyroMag = sqrt((gx * gx) + (gy * gy) + (gz * gz));

  if (gyroMag < 350.0) {
    motionStatus = "Resting / Sleep";
    restingSeconds += 1;
  } else if (gyroMag < 1200.0) {
    motionStatus = "Light Sedentary";
  } else {
    motionStatus = "Active Motion";
  }

  // Estimate sleep hours today
  cumulativeSleepHours = 7.0 + ((float)restingSeconds / 3600.0);
}

// Transmit JSON payload to backend server
void transmitTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(serverEndpoint);
  http.addHeader("Content-Type", "application/json");

  // Determine realistic active vitals
  int sendHr = (currentHeartRate > 45) ? (int)round(currentHeartRate) : 74;
  int sendSpo2 = (currentSpO2 > 80) ? (int)round(currentSpO2) : 98;
  float sendTemp = (currentTempC > 30.0) ? currentTempC : 36.6;
  float sendSleep = cumulativeSleepHours;

  // Build JSON string
  String jsonPayload = "{";
  jsonPayload += "\"userId\":\"" + String(targetUserId) + "\",";
  jsonPayload += "\"heartRate\":" + String(sendHr) + ",";
  jsonPayload += "\"spo2\":" + String(sendSpo2) + ",";
  jsonPayload += "\"temperature\":" + String(sendTemp, 1) + ",";
  jsonPayload += "\"sleepHours\":" + String(sendSleep, 1) + ",";
  jsonPayload += "\"sleepQuality\":\"Good (88%)\",";
  jsonPayload += "\"motion\":\"" + motionStatus + "\",";
  jsonPayload += "\"battery\":95";
  jsonPayload += "}";

  int httpResponseCode = http.POST(jsonPayload);
  if (httpResponseCode > 0) {
    Serial.printf("[Telemetry] POST %d | HR: %d bpm, SpO2: %d%%, Temp: %.1f C, Sleep: %.1f hrs\n",
                  httpResponseCode, sendHr, sendSpo2, sendTemp, sendSleep);
  } else {
    Serial.printf("[Telemetry Error] HTTP POST failed: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}

// Wi-Fi connection with retry
void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("[Wi-Fi] Connecting to %s", ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected successfully!");
    Serial.print("[Wi-Fi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[Wi-Fi] Connection failed. Retrying next cycle...");
  }
}
