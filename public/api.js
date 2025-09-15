// api.js
import { auth, db } from "./firebase.js";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let confirmationResult = null;

export const setupRegisterCaptcha = () => {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "normal"
  });
};

export const setupLoginCaptcha = () => {
  window.recaptchaLogin = new RecaptchaVerifier(auth, "recaptcha-login", {
    size: "normal"
  });
};

export const registerUser = async (phone, username) => {
  confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
  localStorage.setItem("pendingUsername", username);
  return confirmationResult;
};

export const verifyCode = async (code) => {
  const result = await confirmationResult.confirm(code);
  const user = result.user;
  await addDoc(collection(db, "users"), {
    uid: user.uid,
    phone: user.phoneNumber,
    username: localStorage.getItem("pendingUsername")
  });
  return user;
};

export const loginUser = async (phone) => {
  confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaLogin);
  return confirmationResult;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const getUserOrders = async (uid) => {
  const q = query(collection(db, "orders"), where("uid", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
};

export const onUserChanged = (callback) => {
  onAuthStateChanged(auth, callback);
};
