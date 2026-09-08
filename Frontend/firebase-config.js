// firebase-config.js - Firebase Client SDK setup for Frontend
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjQ6Ebt8nDX1K96HsBVkj21DPteU78g0I",
  authDomain: "neuro-tech-01.firebaseapp.com",
  projectId: "neuro-tech-01",
  storageBucket: "neuro-tech-01.firebasestorage.app",
  messagingSenderId: "1073828205384",
  appId: "1:1073828205384:web:be73de1f4e60afd81b597d",
  measurementId: "G-KTBVX7NQCL"
};

// Initialize Firebase & Realtime Database instance
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
