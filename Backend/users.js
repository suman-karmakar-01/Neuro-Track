// users.js - Authority User Management (Create & List Users)
const express = require('express');
const router = express.Router();
const { dbHelper } = require('./firebase');

// Get all users for Authority portal
router.get('/', async (req, res) => {
  try {
    const usersMap = await dbHelper.get('users') || {};
    const users = Object.values(usersMap);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Authority creates a new victim/user and generates UID & PIN
router.post('/create', async (req, res) => {
  const { fullName, phone, email, age, gender, emergencyContact, notes } = req.body;

  if (!fullName) {
    return res.status(400).json({ success: false, message: 'Full name is required' });
  }

  try {
    const existingUsers = await dbHelper.get('users') || {};
    const count = Object.keys(existingUsers).length;

    // Generate unique User ID (e.g. NT1002) and 4-digit PIN
    let uid = `NT${1001 + count}`;
    while (existingUsers[uid]) {
      uid = `NT${Math.floor(1000 + Math.random() * 9000)}`;
    }
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const newUser = {
      uid,
      pin,
      fullName: fullName.trim(),
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : '',
      age: age ? Number(age) : null,
      gender: gender || 'Not Specified',
      emergencyContact: emergencyContact || '',
      notes: notes || '',
      role: 'user',
      latestRiskLevel: 'Not Assessed',
      latestScore: null,
      createdAt: new Date().toISOString()
    };

    await dbHelper.set(`users/${uid}`, newUser);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      credentials: {
        uid,
        pin,
        fullName: newUser.fullName
      },
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// Get detailed user profile and assessment history
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await dbHelper.get(`users/${userId}`);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const assessmentsMap = await dbHelper.get(`assessments/${userId}`) || {};
    const assessments = Object.values(assessmentsMap).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      user,
      assessments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user details' });
  }
});

// Add counselor notes for a user
router.post('/:userId/notes', async (req, res) => {
  const { userId } = req.params;
  const { note } = req.body;

  try {
    const user = await dbHelper.get(`users/${userId}`);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.notes = (user.notes ? user.notes + '\n\n' : '') + `[${new Date().toLocaleDateString()}] ${note}`;
    await dbHelper.set(`users/${userId}`, user);

    res.json({ success: true, message: 'Note added successfully', notes: user.notes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add note' });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { fullName, email, age, gender, studentId } = req.body;

  try {
    const user = await dbHelper.get(`users/${userId}`);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName) user.fullName = fullName.trim();
    if (email !== undefined) user.email = email.trim();
    if (age !== undefined) user.age = age ? Number(age) : user.age;
    if (gender) user.gender = gender;
    if (studentId !== undefined) user.studentId = studentId.trim();

    await dbHelper.set(`users/${userId}`, user);

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

module.exports = router;
