// session.js - 20-Question PTSD/Well-being Screening Assessment & Scoring
const express = require('express');
const router = express.Router();
const { dbHelper } = require('./firebase');

// Supportive recommendations tailored to risk level
const RECOMMENDATIONS = {
  LOW: [
    'Maintain regular sleep and daily routines.',
    'Continue healthy social connections.',
    'Practice relaxation or breathing exercises.',
    'Continue monitoring your well-being.'
  ],
  MODERATE: [
    'Consider discussing ongoing concerns with a trusted person.',
    'Maintain a consistent sleep schedule.',
    'Practice relaxation and grounding techniques.',
    'Consider speaking with a qualified mental-health professional if symptoms persist or interfere with daily life.'
  ],
  HIGH: [
    'Consider seeking support from a qualified mental-health professional.',
    'Reach out to a trusted person rather than dealing with distress alone.',
    'If you feel unsafe or are in immediate danger, contact local emergency services or an appropriate crisis service.',
    'Please note: this system does not attempt to diagnose or prescribe treatment.'
  ]
};

const EXPLANATIONS = {
  LOW: 'Your responses suggest minimal or mild indications of stress and emotional distress at this time.',
  MODERATE: 'Your responses indicate noticeable levels of stress, anxiety, or fatigue that may benefit from proactive self-care and discussion.',
  HIGH: 'Your responses suggest elevated levels of distress that may be interfering with your everyday activities and well-being.'
};

// Submit 20-question assessment
router.post('/submit', async (req, res) => {
  const { userId, answers, vitalSnapshot } = req.body;

  if (!userId || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ success: false, message: 'User ID and answers are required' });
  }

  try {
    // Calculate raw score (0 - 60)
    let rawScore = 0;
    answers.forEach(a => {
      rawScore += Number(a.score || 0);
    });

    // Score out of 100
    const score = Math.min(100, Math.round((rawScore / 60) * 100));

    // Determine demonstration risk category
    let riskLevel = 'LOW';
    if (score >= 67) {
      riskLevel = 'HIGH';
    } else if (score >= 34) {
      riskLevel = 'MODERATE';
    }

    // Check if live ESP32 hardware is actively streaming
    let liveVitals = {
      isHardwareActive: false,
      heartRate: 'Not Applicable',
      spo2: 'Not Applicable',
      temperature: 'Not Applicable',
      sleepHours: 'Not Applicable',
      sleepQuality: 'Not Applicable',
      status: 'Hardware Not Connected'
    };

    try {
      const live = await dbHelper.get(`liveData/${userId}`);
      if (live && typeof live.heartRate === 'number' && live.status === 'Live Stream Active' && live.timestamp) {
        const diffSec = (Date.now() - new Date(live.timestamp).getTime()) / 1000;
        if (diffSec <= 15) {
          liveVitals = {
            isHardwareActive: true,
            heartRate: live.heartRate,
            spo2: live.spo2,
            temperature: typeof live.temperature === 'number' ? live.temperature : 36.6,
            sleepHours: typeof live.sleepHours === 'number' ? live.sleepHours : 7.5,
            sleepQuality: live.sleepQuality || 'Optimal Rest',
            status: 'Live Stream Active'
          };
        }
      }
    } catch (e) {}

    const assessmentId = `ASM-${Date.now().toString().slice(-6)}`;
    const now = new Date();

    const assessmentResult = {
      assessmentId,
      userId,
      timestamp: now.toISOString(),
      dateFormatted: now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      rawScore,
      score,
      maxRawScore: 60,
      riskLevel,
      explanation: EXPLANATIONS[riskLevel],
      recommendations: RECOMMENDATIONS[riskLevel],
      disclaimer: 'Screening/educational result — not a clinical diagnosis.',
      answers,
      vitals: liveVitals
    };

    // Save assessment to Firebase
    await dbHelper.set(`assessments/${userId}/${assessmentId}`, assessmentResult);

    // Update user profile with latest assessment stats
    const user = await dbHelper.get(`users/${userId}`);
    if (user) {
      user.latestRiskLevel = riskLevel;
      user.latestScore = score;
      user.lastAssessmentDate = assessmentResult.dateFormatted;
      await dbHelper.set(`users/${userId}`, user);
    }

    res.json({
      success: true,
      message: 'Assessment evaluated successfully',
      result: assessmentResult
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing assessment' });
  }
});

// Get user assessment history
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const historyMap = await dbHelper.get(`assessments/${userId}`) || {};
    const history = Object.values(historyMap).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

// Get latest assessment for user
router.get('/latest/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const historyMap = await dbHelper.get(`assessments/${userId}`) || {};
    const list = Object.values(historyMap).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const latest = list.length > 0 ? list[0] : null;
    res.json({ success: true, session: latest, latest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch latest assessment' });
  }
});

module.exports = router;
