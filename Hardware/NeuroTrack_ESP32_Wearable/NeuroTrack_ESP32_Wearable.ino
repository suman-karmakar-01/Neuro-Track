#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <MAX30105.h>
#include "heartRate.h"
#include "spo2_algorithm.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include <MPU6050_tockn.h>
#include <U8g2lib.h>
#include <time.h>

const char* ssid = "NAME";
const char* password = "password";

const char* firebaseURL =
  "https://neuro-tech-01-default-rtdb.firebaseio.com/sensorHistory.json";

#define SDA_PIN 21
#define SCL_PIN 22
#define DS18B20_PIN 4

#define OLED_INTERVAL 250
#define FIREBASE_INTERVAL 3000

#define BUFFER_SIZE 100

MAX30105 max30102;
MPU6050 mpu(Wire);

OneWire oneWire(DS18B20_PIN);
DallasTemperature ds18b20(&oneWire);

U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0);

WiFiClientSecure client;

uint32_t irBuffer[BUFFER_SIZE];
uint32_t redBuffer[BUFFER_SIZE];

long irValue = 0;
long redValue = 0;

float bpm = 0;
float bodyTemp = 0;
float maxTemp = 0;

float ax = 0;
float ay = 0;
float az = 0;

float gx = 0;
float gy = 0;
float gz = 0;

int32_t spo2 = 0;
int8_t validSpO2 = 0;

int32_t algorithmHR = 0;
int8_t validHR = 0;

int sampleIndex = 0;

unsigned long lastOLED = 0;
unsigned long lastFirebase = 0;
unsigned long lastTemperature = 0;

long lastBeat = 0;

void setup()
{
  Serial.begin(115200);

  Wire.begin(SDA_PIN, SCL_PIN);

  oled.begin();
  oled.setFont(u8g2_font_6x10_tf);

  oled.clearBuffer();
  oled.drawStr(0, 15, "Neuro Track");
  oled.drawStr(0, 30, "Connecting...");
  oled.sendBuffer();

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(100);
  }

  Serial.println("WiFi connected");
  Serial.println(WiFi.localIP());

  configTime(19800, 0, "pool.ntp.org");

  if (!max30102.begin(Wire, I2C_SPEED_FAST))
  {
    Serial.println("MAX30102 not found");

    oled.clearBuffer();
    oled.drawStr(0, 15, "MAX30102 ERROR");
    oled.sendBuffer();

    while (true);
  }

  max30102.setup();

  max30102.setPulseAmplitudeRed(0x1F);
  max30102.setPulseAmplitudeIR(0x1F);
  max30102.setPulseAmplitudeGreen(0);

  ds18b20.begin();
  ds18b20.setWaitForConversion(false);
  ds18b20.requestTemperatures();

  mpu.begin();
  mpu.calcGyroOffsets(true);

  client.setInsecure();

  oled.clearBuffer();
  oled.drawStr(0, 15, "System Ready");
  oled.sendBuffer();

  lastFirebase = millis();
}

void loop()
{
  readMAX30102();
  readMPU6050();
  readTemperature();

  if (millis() - lastOLED >= OLED_INTERVAL)
  {
    lastOLED = millis();
    updateOLED();
  }

  if (millis() - lastFirebase >= FIREBASE_INTERVAL)
  {
    lastFirebase = millis();
    sendFirebaseData();
  }
}

void readMAX30102()
{
  max30102.check();

  while (max30102.available())
  {
    redValue = max30102.getRed();
    irValue = max30102.getIR();

    max30102.nextSample();

    if (irValue > 50000 && checkForBeat(irValue))
    {
      long delta = millis() - lastBeat;
      lastBeat = millis();

      float currentBPM = 60.0 / (delta / 1000.0);

      if (currentBPM > 20 && currentBPM < 255)
      {
        bpm = currentBPM;
      }
    }

    irBuffer[sampleIndex] = irValue;
    redBuffer[sampleIndex] = redValue;

    sampleIndex++;

    if (sampleIndex >= BUFFER_SIZE)
    {
      maxim_heart_rate_and_oxygen_saturation(
        irBuffer,
        BUFFER_SIZE,
        redBuffer,
        &spo2,
        &validSpO2,
        &algorithmHR,
        &validHR
      );

      if (validHR)
      {
        bpm = algorithmHR;
      }

      sampleIndex = 0;
    }
  }

  maxTemp = max30102.readTemperature();
}

void readMPU6050()
{
  mpu.update();

  ax = mpu.getAccX();
  ay = mpu.getAccY();
  az = mpu.getAccZ();

  gx = mpu.getGyroX();
  gy = mpu.getGyroY();
  gz = mpu.getGyroZ();
}

void readTemperature()
{
  if (millis() - lastTemperature >= 1000)
  {
    lastTemperature = millis();

    float temperature = ds18b20.getTempCByIndex(0);

    if (temperature != DEVICE_DISCONNECTED_C)
    {
      bodyTemp = temperature;
    }

    ds18b20.requestTemperatures();
  }
}

void updateOLED()
{
  char text[24];

  oled.clearBuffer();

  oled.setFont(u8g2_font_6x10_tf);

  struct tm timeInfo;

  if (getLocalTime(&timeInfo, 0))
  {
    strftime(text, sizeof(text), "%H:%M:%S", &timeInfo);
    oled.drawStr(0, 10, text);
  }

  oled.setFont(u8g2_font_helvB10_tf);

  if (bpm > 0)
  {
    snprintf(text, sizeof(text), "HR: %d BPM", (int)bpm);
  }
  else
  {
    snprintf(text, sizeof(text), "HR: -- BPM");
  }

  oled.drawStr(0, 27, text);

  if (validSpO2)
  {
    snprintf(text, sizeof(text), "SpO2: %d%%", (int)spo2);
  }
  else
  {
    snprintf(text, sizeof(text), "SpO2: --%%");
  }

  oled.drawStr(0, 43, text);

  snprintf(text, sizeof(text), "Temp: %.1f C", bodyTemp);
  oled.drawStr(0, 59, text);

  oled.sendBuffer();
}

void sendFirebaseData()
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("WiFi disconnected");
    return;
  }

  struct timeval tv;

  if (!gettimeofday(&tv, NULL))
  {
    unsigned long long timestamp =
      ((unsigned long long)tv.tv_sec * 1000ULL) +
      (tv.tv_usec / 1000);

    String json = "{";

    json += "\"timestamp\":";
    json += String(timestamp);

    json += ",\"max30102\":{";

    json += "\"ir\":";
    json += String(irValue);

    json += ",\"red\":";
    json += String(redValue);

    json += ",\"temp2\":";
    json += String(maxTemp, 2);

    json += "}";

    json += ",\"temp1\":";
    json += String(bodyTemp, 2);

    json += ",\"mpu6050\":{";

    json += "\"a_x\":";
    json += String(ax, 2);

    json += ",\"a_y\":";
    json += String(ay, 2);

    json += ",\"a_z\":";
    json += String(az, 2);

    json += ",\"g_x\":";
    json += String(gx, 2);

    json += ",\"g_y\":";
    json += String(gy, 2);

    json += ",\"g_z\":";
    json += String(gz, 2);

    json += "}";

    json += "}";

    HTTPClient http;

    http.begin(client, firebaseURL);
    http.addHeader("Content-Type", "application/json");

    int responseCode = http.POST(json);

    Serial.print("Firebase HTTP: ");
    Serial.println(responseCode);

    if (responseCode > 0)
    {
      Serial.println(http.getString());
    }

    http.end();
  }
}
