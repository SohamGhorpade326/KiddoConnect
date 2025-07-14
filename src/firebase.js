// Import core firebase functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJ3E6mqZtPAf_5IjxhF0n9aKMx6TQqPp4",
  authDomain: "social-media-platform-b1b40.firebaseapp.com",
  projectId: "social-media-platform-b1b40",
  storageBucket: "social-media-platform-b1b40.firebasestorage.app",
  messagingSenderId: "350745834113",
  appId: "1:350745834113:web:27e0cb5d0521b9e1a05380",
  measurementId: "G-T6NXLE472L"
};
// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export auth and db
export const auth = getAuth(app);
export const db = getFirestore(app);