let allProducts = [];
// api.js
import { db, auth } from './firebase.js';
import { collection, doc, getDocs, setDoc, addDoc, query, where } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const DB_USERS = 'db_users';
const DB_ORDERS = 'db_orders';
const DB_PRODUCTS = 'db_products';
const DB_INITIALIZED = 'db_initialized';
// Firestore коллекции
const usersCol = collection(db, "users");
const productsCol = collection(db, "products");
const ordersCol = collection(db, "orders");

const _get_from_storage = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const _set_to_storage = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const _simulateDelay = (data) => new Promise(resolve => setTimeout(() => resolve(data), 200));

export const initApi = async () => {
  if (!localStorage.getItem(DB_INITIALIZED)) {
    try {
      const response = await fetch('products.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const initialProducts = await response.json();
      _set_to_storage(DB_PRODUCTS, initialProducts);
      _set_to_storage(DB_USERS, []);
      _set_to_storage(DB_ORDERS, []);
      localStorage.setItem(DB_INITIALIZED, 'true');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      _set_to_storage(DB_PRODUCTS, []);
    }
  }
  allProducts = _get_from_storage(DB_PRODUCTS);
// ====== PRODUCTS ======
export const getProducts = async () => {
  const snapshot = await getDocs(productsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getProducts = () => _simulateDelay(allProducts);
export const getProductById = async (id) => {
  const snapshot = await getDocs(productsCol);
  const product = snapshot.docs.find(doc => doc.id === id);
  return product ? { id: product.id, ...product.data() } : null;
};

export const getProductById = (id) => _simulateDelay(allProducts.find(p => p.id === id));
// ====== USERS ======
export const registerUser = async ({ email, password, username }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

export const registerUser = (userData) => {
  const users = _get_from_storage(DB_USERS);
  if (users.some(u => u.email === userData.email)) {
    return Promise.reject({ message: 'Пользователь с таким email уже существует.' });
  }
  const newUser = {
    id: Date.now(),
    ordersHistory: [],
    ...userData
  };
  users.push(newUser);
  _set_to_storage(DB_USERS, users);
  return _simulateDelay(newUser);
  await setDoc(doc(usersCol, uid), { username, email, ordersHistory: [] });
  return { id: uid, username, email };
};

export const loginUser = (credentials) => {
  const users = _get_from_storage(DB_USERS);
  const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
  if (user) {
    return _simulateDelay(user);
  }
  return Promise.reject({ message: 'Неверный email или пароль.' });
export const loginUser = async ({ email, password }) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;
  const userDoc = await getDocs(query(usersCol, where("__name__", "==", uid)));
  if (userDoc.empty) throw new Error("Пользователь не найден");
  const userData = userDoc.docs[0].data();
  return { id: uid, ...userData };
};

export const createOrder = (orderData) => {
  const orders = _get_from_storage(DB_ORDERS);
  const newOrder = { id: Date.now(), ...orderData };
  orders.push(newOrder);
  _set_to_storage(DB_ORDERS, orders);
// ====== ORDERS ======
export const createOrder = async ({ userId, items, totalAmount }) => {
  const orderRef = await addDoc(ordersCol, {
    userId,
    items,
    totalAmount,
    status: "В обработке",
    createdAt: new Date().toISOString()
  });

  if (orderData.userId) {
    const users = _get_from_storage(DB_USERS);
    const user = users.find(u => u.id === orderData.userId);
    if (user) {
      if (!user.ordersHistory) user.ordersHistory = [];
      user.ordersHistory.push(newOrder.id);
      _set_to_storage(DB_USERS, users);
    }
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
  return _simulateDelay(newOrder);

  return { id: orderRef.id, userId, items, totalAmount, status: "В обработке" };
};

export const getOrdersByUserId = (userId) => {
  const orders = _get_from_storage(DB_ORDERS);
  return _simulateDelay(orders.filter(o => o.userId === userId));
export const getOrdersByUserId = async (userId) => {
  const snapshot = await getDocs(query(ordersCol, where("userId", "==", userId)));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
