import { getProducts } from './api.js';

const CART_STORAGE_KEY = 'cart';

let cartItems = [];

const saveCart = () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    updateCartCount();
};

export const loadCart = () => {
    cartItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    updateCartCount();
};

export const getCartItems = () => cartItems;

export const addToCart = (productId, quantity = 1) => {
    const existingItem = cartItems.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cartItems.push({ id: productId, quantity });
    }
    saveCart();
};

export const removeFromCart = (productId) => {
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCart();
};

export const updateCartQuantity = (productId, quantity) => {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
        if (quantity > 0) {
            item.quantity = quantity;
        } else {
            removeFromCart(productId);
        }
    }
    saveCart();
};

export const clearCart = () => {
    cartItems = [];
    saveCart();
};

export const getCartTotal = async () => {
    const products = await getProducts();
    return cartItems.reduce((total, item) => {
        const product = products.find(p => p.id === item.id);
        return total + (product ? product.price * item.quantity : 0);
    }, 0);
};

export const updateCartCount = () => {
    const cartCountEl = document.getElementById('cart-count');
    if (!cartCountEl) return;
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = count;
    cartCountEl.style.display = count > 0 ? 'flex' : 'none';
};
