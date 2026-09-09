// login.js - Authentication for User (UID + PIN) & Authority (Email/Phone + Password)
const express = require('express');
const router = express.Router();
const { dbHelper } = require('./firebase');

// User login via Student UID and PIN
router.post('/user-login', async (req, res) => {
  const { uid, pin } = req.body;

  if (!uid || !pin) {
    return res.status(400).json({ success: false, message: 'Please enter both UID and PIN' });
  }

  try {
    const user = await dbHelper.get('users/' + uid.trim());

    if (!user) {
      return res.status(404).json({ success: false, message: 'User ID not found. Must be registered by Authority first.' });
    }

    if (String(user.pin).trim() !== String(pin).trim()) {
      return res.status(401).json({ success: false, message: 'Incorrect PIN' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        uid: user.uid,
        userId: user.uid,
        fullName: user.fullName,
        name: user.fullName,
        email: user.email || '',
        phone: user.phone || '',
        age: user.age || 20,
        gender: user.gender || 'Not Specified',
        studentId: user.studentId || user.uid,
        role: 'user',
        latestRiskLevel: user.latestRiskLevel || 'Not Assessed',
        latestScore: user.latestScore || null,
        createdAt: user.createdAt || new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server login error' });
  }
});

// Authority login via Email or Phone + Password
router.post('/authority-login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please enter Email/Phone and Password' });
  }

  try {
    const auths = await dbHelper.get('authorities') || {};
    const authList = Object.values(auths);

    const cleanIdent = identifier.trim().toLowerCase();
    const authority = authList.find(a => 
      (a.email && a.email.toLowerCase() === cleanIdent) || 
      (a.email && (cleanIdent === 'admin@neurotrack.com' || cleanIdent === 'admin@neurotech.com') && (a.email.toLowerCase() === 'admin@neurotrack.com' || a.email.toLowerCase() === 'admin@neurotech.com')) ||
      (a.phone && a.phone.replace(/\D/g, '') === identifier.replace(/\D/g, ''))
    );

    if (!authority) {
      return res.status(404).json({ success: false, message: 'Authority account not found' });
    }

    if (authority.password !== password.trim()) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    res.json({
      success: true,
      message: 'Authority login successful',
      user: {
        id: authority.id,
        fullName: authority.fullName,
        email: authority.email,
        phone: authority.phone,
        role: 'authority'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server login error' });
  }
});

// Authority registration
router.post('/authority-register', async (req, res) => {
  const { fullName, email, phone, designation, department, password } = req.body;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ success: false, message: 'Full Name is required' });
  }

  if (!email && !phone) {
    return res.status(400).json({ success: false, message: 'Please provide either an Email address or Phone number' });
  }

  if (!password || password.trim().length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  try {
    const auths = await dbHelper.get('authorities') || {};
    const authList = Object.values(auths);

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    // Check for duplicate email or phone
    const duplicate = authList.find(a => 
      (cleanEmail && a.email && a.email.toLowerCase() === cleanEmail) ||
      (cleanPhone && a.phone && a.phone.replace(/\D/g, '') === cleanPhone)
    );

    if (duplicate) {
      return res.status(409).json({ success: false, message: 'An authority account with this Email or Phone already exists' });
    }

    const authorityId = `auth_${Date.now()}`;
    const newAuthority = {
      id: authorityId,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      designation: designation ? designation.trim() : 'Authorized Counselor',
      department: department ? department.trim() : 'Counseling & Mental Health Services',
      password: password.trim(),
      role: 'authority',
      createdAt: new Date().toISOString()
    };

    await dbHelper.set(`authorities/${authorityId}`, newAuthority);

    res.status(201).json({
      success: true,
      message: 'Authority registered successfully',
      user: {
        id: newAuthority.id,
        fullName: newAuthority.fullName,
        email: newAuthority.email,
        phone: newAuthority.phone,
        designation: newAuthority.designation,
        department: newAuthority.department,
        role: 'authority'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to register authority account' });
  }
});

module.exports = router;
