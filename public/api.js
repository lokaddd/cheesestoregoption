let allProducts = [];

const DB_USERS = 'db_users';
const DB_ORDERS = 'db_orders';
const DB_PRODUCTS = 'db_products';
const DB_INITIALIZED = 'db_initialized';

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
};

export const getProducts = () => _simulateDelay(allProducts);

export const getProductById = (id) => _simulateDelay(allProducts.find(p => p.id === id));

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
};

export const loginUser = (credentials) => {
  const users = _get_from_storage(DB_USERS);
  const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
  if (user) {
    return _simulateDelay(user);
  }
  return Promise.reject({ message: 'Неверный email или пароль.' });
};

export const createOrder = (orderData) => {
  const orders = _get_from_storage(DB_ORDERS);
  const newOrder = { id: Date.now(), ...orderData };
  orders.push(newOrder);
  _set_to_storage(DB_ORDERS, orders);

  if (orderData.userId) {
    const users = _get_from_storage(DB_USERS);
    const user = users.find(u => u.id === orderData.userId);
    if (user) {
      if (!user.ordersHistory) user.ordersHistory = [];
      user.ordersHistory.push(newOrder.id);
      _set_to_storage(DB_USERS, users);
    }
  }
  return _simulateDelay(newOrder);
};

export const getOrdersByUserId = (userId) => {
  const orders = _get_from_storage(DB_ORDERS);
  return _simulateDelay(orders.filter(o => o.userId === userId));
};
