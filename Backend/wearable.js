// wearable.js - Wearable Sensor Telemetry with Safe Flatline Baseline for Hardware Standby
const express = require('express');
const router = express.Router();
const { dbHelper } = require('./firebase');

// Disconnected state when no hardware is connected
function getDisconnectedPoint(timeOffsetSec = 0) {
  const d = new Date(Date.now() - timeOffsetSec * 1000);
  return {
    heartRate: 'Not Applicable',
    spo2: 'Not Applicable',
    temperature: 'Not Applicable',
    sleepHours: 'Not Applicable',
    sleepQuality: 'Not Applicable',
    motion: 0,
    battery: '--',
    status: 'Hardware Disconnected',
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timestamp: d.toISOString()
  };
}

// Ingest telemetry from ESP32 (Wi-Fi client sending every 5 seconds)
router.post('/data', async (req, res) => {
  const targetUserId = req.body.userId || req.body.user_id;

  if (!targetUserId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  const deviceId = req.body.deviceId || req.body.device_id || 'NT-ESP32-001';
  const hrVal = typeof req.body.heartRate !== 'undefined' ? req.body.heartRate : req.body.heart_rate;
  const spo2Val = typeof req.body.spo2 !== 'undefined' ? req.body.spo2 : req.body.spO2;
  const tempVal = typeof req.body.temperature !== 'undefined' ? req.body.temperature : (req.body.temp || 36.6);
  const motionVal = typeof req.body.motion !== 'undefined' ? req.body.motion : 0.03;
  const sleepHrs = typeof req.body.sleepHours !== 'undefined' ? req.body.sleepHours : (req.body.sleep_hours || 7.5);
  let restStatus = req.body.sleepQuality || req.body.sleep_quality;
  if (!restStatus) {
    restStatus = motionVal < 0.05 ? 'Optimal (Restful)' : (motionVal < 0.15 ? 'Mild Movement' : 'Restless');
  }

  const reading = {
    deviceId: deviceId,
    userId: targetUserId,
    heartRate: Number(hrVal) || 72,
    spo2: Number(spo2Val) || 98,
    temperature: Number(tempVal) || 36.6,
    motion: Number(motionVal) || 0.03,
    sleepHours: Number(sleepHrs) || 7.5,
    sleepQuality: restStatus,
    battery: Number(req.body.battery) || 85,
    status: 'Live Stream Active',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timestamp: new Date().toISOString()
  };

  try {
    // Update live state in real-time
    await dbHelper.set(`liveData/${targetUserId}`, reading);

    // Rate-limited history: append at most once every 4 seconds to prevent storage overflow
    const history = await dbHelper.get(`sensorHistory/${targetUserId}`) || [];
    const list = Array.isArray(history) ? history : Object.values(history);
    const lastItem = list.length > 0 ? list[list.length - 1] : null;

    let shouldAppend = true;
    if (lastItem && lastItem.timestamp) {
      const elapsed = (Date.now() - new Date(lastItem.timestamp).getTime()) / 1000;
      if (elapsed < 4) shouldAppend = false;
    }

    if (shouldAppend) {
      list.push(reading);
      if (list.length > 50) list.shift(); // Retain latest 50 samples
      await dbHelper.set(`sensorHistory/${targetUserId}`, list);
    }

    res.json({ success: true, message: 'Telemetry received and synced' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Telemetry ingest error' });
  }
});

// Live current reading for user dashboard, live monitor, and statistics
router.get('/live/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const live = await dbHelper.get(`liveData/${userId}`);
    // Active only if live packet arrived within 15s (generous leeway for 5s transmission interval)
    if (live && typeof live.heartRate === 'number' && live.status === 'Live Stream Active' && live.timestamp) {
      const diffSec = (Date.now() - new Date(live.timestamp).getTime()) / 1000;
      if (diffSec <= 15) {
        return res.json({
          success: true,
          ...live,
          telemetry: live,
          data: live,
          isHardwareActive: true
        });
      }
    }

    // Return disconnected state when no hardware is currently streaming
    const disconnected = getDisconnectedPoint(0);
    res.json({
      success: true,
      ...disconnected,
      telemetry: disconnected,
      data: disconnected,
      isHardwareActive: false
    });
  } catch (err) {
    const disconnected = getDisconnectedPoint(0);
    res.json({
      success: true,
      ...disconnected,
      telemetry: disconnected,
      data: disconnected,
      isHardwareActive: false
    });
  }
});

// Historical readings for graph plotting (flatline baseline when hardware is disconnected)
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const live = await dbHelper.get(`liveData/${userId}`);
    let isActive = false;
    if (live && typeof live.heartRate === 'number' && live.status === 'Live Stream Active' && live.timestamp) {
      const diffSec = (Date.now() - new Date(live.timestamp).getTime()) / 1000;
      if (diffSec <= 15) isActive = true;
    }

    if (isActive) {
      const history = await dbHelper.get(`sensorHistory/${userId}`);
      const list = history ? (Array.isArray(history) ? history : Object.values(history)) : [];
      if (list.length > 0) {
        return res.json({ success: true, history: list, readings: list, isHardwareActive: true });
      }
    }

    // Generate flatline points when hardware is disconnected
    const flatList = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.now() - i * 5000);
      flatList.push({
        heartRate: 0,
        spo2: 0,
        temperature: 0,
        motion: 0,
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: 'Hardware Disconnected'
      });
    }

    res.json({
      success: true,
      history: flatList,
      readings: flatList,
      isHardwareActive: false
    });
  } catch (err) {
    res.json({ success: true, history: [], readings: [], isHardwareActive: false });
  }
});

module.exports = router;
