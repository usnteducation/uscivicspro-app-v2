// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- INCOLLA QUI SOTTO I TUOI DATI DI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBsKb-h8a3CrOiYQOiCV7hNAS6rwNEbggo",
  authDomain: "uscivicspro.firebaseapp.com",
  projectId: "uscivicspro",
  storageBucket: "uscivicspro.firebasestorage.app",
  messagingSenderId: "779279567784",
  appId: "1:779279567784:web:15eaf54a5893291a06ab9d"
};
// ------------------------------------------------

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);