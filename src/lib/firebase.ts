// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "travel-buddy-india-sbj6m",
  appId: "1:72166677805:web:a98e2adb1ade4ea282c7a4",
  storageBucket: "travel-buddy-india-sbj6m.firebasestorage.app",
  apiKey: "AIzaSyAiyLmKTjSKXqB9Hjv6JWPfFe5nLRauQ5g",
  authDomain: "travel-buddy-india-sbj6m.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "72166677805",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Add this declaration for the reCAPTCHA verifier
declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}


export { app, auth };
