// api.js
import { db, auth } from './firebase.js';
import { collection, doc, getDocs, setDoc, addDoc, query, where } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Firestore коллекции
const usersCol = collection(db, "users");
const productsCol = collection(db, "products");
const ordersCol = collection(db, "orders");

// ====== PRODUCTS ======
export const getProducts = async () => {
  const snapshot = await getDocs(productsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getProductById = async (id) => {
  const snapshot = await getDocs(productsCol);
  const product = snapshot.docs.find(doc => doc.id === id);
  return product ? { id: product.id, ...product.data() } : null;
};

// ====== USERS ======
export const registerUser = async ({ email, password, username }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  await setDoc(doc(usersCol, uid), { username, email, ordersHistory: [] });
  return { id: uid, username, email };
};

export const loginUser = async ({ email, password }) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;
  const userDoc = await getDocs(query(usersCol, where("__name__", "==", uid)));
  if (userDoc.empty) throw new Error("Пользователь не найден");
  const userData = userDoc.docs[0].data();
  return { id: uid, ...userData };
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

  // Обновляем историю заказов пользователя
  const userRef = doc(usersCol, userId);
  const userSnapshot = await getDocs(query(usersCol, where("__name__", "==", userId)));
  if (!userSnapshot.empty) {
    const user = userSnapshot.docs[0];
    const data = user.data();
    const ordersHistory = data.ordersHistory || [];
    ordersHistory.push(orderRef.id);
    await setDoc(userRef, { ...data, ordersHistory });
  }

  return { id: orderRef.id, userId, items, totalAmount, status: "В обработке" };
};

export const getOrdersByUserId = async (userId) => {
  const snapshot = await getDocs(query(ordersCol, where("userId", "==", userId)));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
