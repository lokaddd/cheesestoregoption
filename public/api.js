// api.js
import { db, auth } from './firebase.js';
import { collection, doc, getDocs, setDoc, addDoc, query, where } from "firebase/firestore";
import { signInWithPhoneNumber } from "firebase/auth";

// Коллекции
const usersCol = collection(db, "users");
const productsCol = collection(db, "products");
const ordersCol = collection(db, "orders");

/**
 * Отправить код на телефон. Принимает phoneNumber (строка) и appVerifier (RecaptchaVerifier).
 * Возвращает confirmationResult (нужно сохранить на клиенте для подтверждения кода).
 */
export async function sendPhoneCode(phoneNumber, appVerifier) {
  if (!phoneNumber) throw new Error('Номер телефона обязателен');
  if (!appVerifier) throw new Error('appVerifier (recaptcha) обязателен');
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  // confirmationResult.confirm(code) — для подтверждения
  return confirmationResult;
}

/**
 * Подтверждение кода (confirmationResult.confirm(code)) — логика выполняется на клиенте (см. app.js).
 * После успешного входа/регистрации — создаём профиль в Firestore, если его нет.
 */
export async function ensureUserDoc(user) {
  if (!user || !user.uid) return;
  const uid = user.uid;
  const userSnapshot = await getDocs(query(usersCol, where("__name__", "==", uid)));
  if (userSnapshot.empty) {
    // создаём базовый профиль; если у пользователя есть phoneNumber - сохраняем
    const data = {
      phoneNumber: user.phoneNumber || null,
      ordersHistory: [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(usersCol, uid), data);
    return { id: uid, ...data };
  } else {
    const docSnap = userSnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }
}

// ====== PRODUCTS ======
export const getProducts = async () => {
  const snapshot = await getDocs(productsCol);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getProductById = async (id) => {
  const snapshot = await getDocs(productsCol);
  const product = snapshot.docs.find(d => d.id === id);
  return product ? { id: product.id, ...product.data() } : null;
};

// ====== ORDERS ======
export const createOrder = async ({ userId, items, totalAmount }) => {
  const orderRef = await addDoc(ordersCol, {
    userId,
    items,
    totalAmount,
    status: "В обработке",
    createdAt: new Date().toISOString()
  });

  // Обновим историю пользователя
  const userRef = doc(usersCol, userId);
  const userSnapshot = await getDocs(query(usersCol, where("__name__", "==", userId)));
  if (!userSnapshot.empty) {
    const userDoc = userSnapshot.docs[0];
    const data = userDoc.data();
    const ordersHistory = data.ordersHistory || [];
    ordersHistory.push(orderRef.id);
    await setDoc(userRef, { ...data, ordersHistory });
  }

  return { id: orderRef.id, userId, items, totalAmount, status: "В обработке" };
};

export const getOrdersByUserId = async (userId) => {
  const snapshot = await getDocs(query(ordersCol, where("userId", "==", userId)));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};
