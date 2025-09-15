// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyClmlYGs-MTWsC5HBVDTgEdKnQ9qT8_oSY",
  authDomain: "lovecheese2311.firebaseapp.com",
  projectId: "lovecheese2311",
  storageBucket: "lovecheese2311.firebasestorage.app",
  messagingSenderId: "1005433122211",
  appId: "1:1005433122211:web:605999b1d8c680ac4ebe16",
  measurementId: "G-21R5ZN94LZ"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
