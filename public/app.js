// app.js
import { addToCart, getCart, removeFromCart } from "./cart.js";
import {
  setupRegisterCaptcha,
  setupLoginCaptcha,
  registerUser,
  verifyCode,
  loginUser,
  logoutUser,
  onUserChanged,
  getUserOrders
} from "./api.js";

const root = document.getElementById("app-root");

const loadTemplate = (id) => {
  const tpl = document.getElementById(id);
  return tpl ? tpl.content.cloneNode(true) : document.createTextNode("404");
};

const render = async () => {
  const hash = location.hash.slice(1) || "home";
  root.innerHTML = "";
  switch (hash) {
    case "home":
      root.append(loadTemplate("home-page-template"));
      break;
    case "catalog":
      root.append(loadTemplate("catalog-page-template"));
      const products = await fetch("./products.json").then((r) => r.json());
      const grid = document.getElementById("product-grid");
      products.forEach((p) => {
        const div = document.createElement("div");
        div.innerHTML = `<h3>${p.name}</h3><p>${p.price} ₽</p><button>Купить</button>`;
        div.querySelector("button").addEventListener("click", () => addToCart(p));
        grid.append(div);
      });
      break;
    case "cart":
      root.append(loadTemplate("cart-page-template"));
      const cart = getCart();
      const cont = document.getElementById("cart-items-container");
      cart.forEach((c) => {
        const div = document.createElement("div");
        div.innerHTML = `${c.name} x${c.qty} <button>Удалить</button>`;
        div.querySelector("button").addEventListener("click", () => {
          removeFromCart(c.id);
          render();
        });
        cont.append(div);
      });
      break;
    case "auth":
      root.append(loadTemplate("auth-page-template"));
      setupRegisterCaptcha();
      setupLoginCaptcha();

      document.getElementById("register-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const phone = e.target.phone.value;
        const username = e.target.username.value;
        await registerUser(phone, username);
        document.getElementById("verify-form").style.display = "block";
      });

      document.getElementById("verify-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const code = document.getElementById("sms-code").value;
        await verifyCode(code);
        location.hash = "profile";
      });

      document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const phone = e.target.phone.value;
        await loginUser(phone);
        document.getElementById("verify-form").style.display = "block";
      });
      break;
    case "profile":
      root.append(loadTemplate("profile-page-template"));
      onUserChanged(async (user) => {
        if (!user) {
          location.hash = "auth";
          return;
        }
        document.getElementById("profile-username").textContent = user.phoneNumber;
        document.getElementById("logout-button").onclick = async () => {
          await logoutUser();
          location.hash = "home";
        };
        const orders = await getUserOrders(user.uid);
        const hist = document.getElementById("order-history");
        orders.forEach((o) => {
          const div = document.createElement("div");
          div.textContent = JSON.stringify(o);
          hist.append(div);
        });
      });
      break;
    default:
      root.textContent = "404 Not Found";
  }
};

window.addEventListener("hashchange", render);
render();
