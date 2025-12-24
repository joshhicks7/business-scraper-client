import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
// You can override these with environment variables if needed (REACT_APP_ prefix)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAj0DnBCliJLjrzxxNBtvfO7M2cBcVNJm8",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "businessscrap-6bc9b.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "businessscrap-6bc9b",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "businessscrap-6bc9b.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1026627615754",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1026627615754:web:d71e07bf797657bdce33f3",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-57956JC0Q7"
};

// Initialize Firebase
let app, db, auth, analytics;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize services
  db = getFirestore(app);
  auth = getAuth(app);
  
  // Initialize Analytics (only in browser environment)
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.warn('Firebase is not properly configured. Some features may not work.');
}

export { db, auth, analytics };
export default app;
