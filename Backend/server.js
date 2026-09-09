// server.js - Main Express Entry Point
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files directly from Frontend folder
app.use(express.static(path.join(__dirname, '../Frontend')));

// Import route modules
const loginRoutes = require('./login');
const sessionRoutes = require('./session');
const wearableRoutes = require('./wearable');
const usersRoutes = require('./users');

// Mount API routes
app.use('/api/auth', loginRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/wearable', wearableRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Neuro Track backend is running' });
});

// Root fallback to frontend index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
