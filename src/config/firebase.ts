// src/config/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCEm1tXmgRJxfgeakA-UTca2WId4-KO6k",
  authDomain: "intern-management-83845.firebaseapp.com",
  projectId: "intern-management-83845",
  storageBucket: "intern-management-83845.appspot.com", // ✅ fixed typo: "firebasestorage.app" → "appspot.com"
  messagingSenderId: "358299223179",
  appId: "1:358299223179:web:978b4ee16a60583c59408e",
  measurementId: "G-YKVB0HRZ4L"
};

// Prevent duplicate app initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
