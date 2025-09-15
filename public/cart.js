// cart.js
import { getProducts } from './api.js';

const CART_KEY = 'cart';
let cartItems = [];

export const loadCart = () => {
  cartItems = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  updateCartCount();
};

export const getCartItems = () => cartItems;

export const addToCart = (id, quantity = 1) => {
  const item = cartItems.find(i => i.id === id);
  if (item) item.quantity += quantity;
  else cartItems.push({ id, quantity });
  saveCart();
};

export const removeFromCart = (id) => {
  cartItems = cartItems.filter(i => i.id !== id);
  saveCart();
};

export const updateCartQuantity = (id, quantity) => {
  const item = cartItems.find(i => i.id === id);
  if (item) {
    if (quantity > 0) item.quantity = quantity;
    else removeFromCart(id);
  }
  saveCart();
};

export const clearCart = () => {
  cartItems = [];
  saveCart();
};

export const getCartTotal = async () => {
  const products = await getProducts();
  return cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
};

const saveCart = () => {
  localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  updateCartCount();
};

export const updateCartCount = () => {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const count = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  el.textContent = count;
  el.style.display = count > 0 ? 'flex' : 'none';
};
