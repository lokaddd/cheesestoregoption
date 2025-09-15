
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClmlYGs-MTWsC5HBVDTgEdKnQ9qT8_oSY",
  authDomain: "lovecheese2311.firebaseapp.com",
  projectId: "lovecheese2311",
  storageBucket: "lovecheese2311.appspot.com",
  messagingSenderId: "1005433122211",
  appId: "1:1005433122211:web:605999b1d8c680ac4ebe16"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
