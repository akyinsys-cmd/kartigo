import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLPbmF0NjhhRdOjYslMTxL-dY0tb1gjms",
  authDomain: "kartigo-online.firebaseapp.com",
  projectId: "kartigo-online",
  storageBucket: "kartigo-online.firebasestorage.app",
  messagingSenderId: "998146196797",
  appId: "1:998146196797:web:8bfdbee2d4b2dcb2c37154",
  measurementId: "G-3ZVF7S6GTY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-kartigodocs-333fe419-3cb1-4b0b-8a1b-47888bd8b1e4");
export const googleProvider = new GoogleAuthProvider();

export default app;
