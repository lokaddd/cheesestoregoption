// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
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

/**
 * Создаёт/рендерит reCAPTCHA verifier.
 * containerId - id DOM элемента, куда рендерить (по умолчанию 'recaptcha-container').
 * Возвращает экземпляр RecaptchaVerifier.
 */
export function createRecaptcha(containerId = 'recaptcha-container', size = 'invisible') {
  // eslint-disable-next-line no-undef
  if (typeof window === 'undefined') return null;
  // Если уже есть — удалим старый (чтобы не было повторного рендера)
  try {
    // При использовании модульного SDK, RecaptchaVerifier может быть в auth
    // Создаём новый:
    const verifier = new RecaptchaVerifier(containerId, { size }, auth);
    verifier.render().catch(()=>{ /* ignore render errors */});
    return verifier;
  } catch (e) {
    console.error('Recaptcha error', e);
    return null;
  }
}
