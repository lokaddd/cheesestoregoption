// cart.js
let cart = JSON.parse(localStorage.getItem("cart")) || [];

export const addToCart = (product) => {
  const item = cart.find((p) => p.id === product.id);
  if (item) {
    item.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
};

export const removeFromCart = (id) => {
  cart = cart.filter((p) => p.id !== id);
  saveCart();
};

export const getCart = () => cart;

export const clearCart = () => {
  cart = [];
  saveCart();
};

const saveCart = () => {
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").textContent = cart.reduce((a, b) => a + b.qty, 0);
};
