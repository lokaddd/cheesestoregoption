// app.js
import * as api from './api.js';
import * as cart from './cart.js';
import { auth, createRecaptcha } from './firebase.js';
import { onAuthStateChanged } from "firebase/auth";

window.addEventListener('DOMContentLoaded', async () => {
  const appRoot = document.getElementById('app-root');
  const state = { currentUser: null, confirmationResult: null };

  cart.loadCart();

  const renderer = {
    render(templateId) {
      const tpl = document.getElementById(templateId);
      if (!tpl) {
        appRoot.innerHTML = `<p>Ошибка: шаблон #${templateId} не найден</p>`;
        return;
      }
      appRoot.innerHTML = '';
      appRoot.appendChild(tpl.content.cloneNode(true));
    },
    async renderHomePage() { renderer.render('home-page-template'); },
    async renderCatalogPage() {
      renderer.render('catalog-page-template');
      const products = await api.getProducts();
      const grid = document.getElementById('product-grid');
      if(!grid) return;
      grid.innerHTML = products.map(p => `
        <a href="#product/${p.id}" class="product-card">
          <img src="${p.imageUrl}" alt="${p.name}">
          <div>
            <h3>${p.name}</h3>
            <p style="color:#bbb">${p.description.substring(0,70)}...</p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
              <span style="font-weight:600">${p.price} ₽</span>
              <button class="button" data-action="add-to-cart" data-product-id="${p.id}">В корзину</button>
            </div>
          </div>
        </a>
      `).join('');
    },
    async renderProductPage(id) {
      const product = await api.getProductById(id);
      if (!product) { appRoot.innerHTML = '<p>Товар не найден</p>'; return; }
      renderer.render('product-page-template');
      document.querySelector('.product-detail-name').textContent = product.name;
      document.querySelector('.product-detail-desc').textContent = product.description;
      document.querySelector('.product-detail-price').textContent = `${product.price} ₽`;
      const btn = document.querySelector('[data-action="add-to-cart"]');
      if (btn) btn.dataset.productId = product.id;
    },
    renderAuthPage() {
      renderer.render('auth-page-template');
      setupAuthHandlers();
    }
  };

  // ===== Router =====
  const router = {
    routes: {
      '': renderer.renderHomePage,
      '#': renderer.renderHomePage,
      '#catalog': renderer.renderCatalogPage,
      '#product': renderer.renderProductPage,
      '#auth': renderer.renderAuthPage,
    },
    handle() {
      const hash = window.location.hash || '#';
      const [path, param] = hash.split('/');
      const handler = this.routes[path] || this.routes[''];
      if (handler) handler(param);
    }
  };

  window.addEventListener('hashchange', () => router.handle());
  router.handle();

  // Global handlers
  appRoot.addEventListener('click', e => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const { action, productId } = target.dataset;
    if (action === 'add-to-cart') cart.addToCart(productId || target.dataset.productId);
  });

  // ===== Auth handling: phone auth =====
  function setupAuthHandlers() {
    const sendForm = document.getElementById('phone-send-form');
    const verifyForm = document.getElementById('phone-verify-form');
    const phoneInput = document.getElementById('phone-number');
    const smsInput = document.getElementById('sms-code');
    const sendError = document.getElementById('send-error');
    const verifyError = document.getElementById('verify-error');
    const sendBtn = document.getElementById('send-code-button');
    const confirmBtn = document.getElementById('confirm-code-button');

    // Инициализация reCAPTCHA (invisible) — рендерим в #recaptcha-container
    let appVerifier = createRecaptcha('recaptcha-container', 'invisible');

    sendBtn.addEventListener('click', async () => {
      sendError.textContent = '';
      const phone = phoneInput.value.trim();
      if (!phone) { sendError.textContent = 'Введите номер телефона'; return; }
      try {
        // Отправляем СМС
        const confirmationResult = await api.sendPhoneCode(phone, appVerifier);
        state.confirmationResult = confirmationResult;
        sendForm.style.display = 'none';
        verifyForm.style.display = 'block';
      } catch (err) {
        console.error(err);
        sendError.textContent = err.message || 'Ошибка отправки SMS';
        // попробуем снова пересоздать reCAPTCHA
        appVerifier = createRecaptcha('recaptcha-container', 'invisible');
      }
    });

    confirmBtn.addEventListener('click', async () => {
      verifyError.textContent = '';
      const code = smsInput.value.trim();
      if (!code) { verifyError.textContent = 'Введите код из SMS'; return; }
      try {
        const confirmationResult = state.confirmationResult;
        if (!confirmationResult) { verifyError.textContent = 'Повторно отправьте код'; return; }
        // Подтверждение кода — возвращает userCredential
        const userCredential = await confirmationResult.confirm(code);
        const user = userCredential.user;
        await api.ensureUserDoc(user); // создаём профиль в Firestore, если нужно
        // После успешного входа — обновляем state/currentUser
        state.currentUser = user;
        // Перейдём в профиль/главную
        window.location.hash = '#/';
      } catch (err) {
        console.error(err);
        verifyError.textContent = err.message || 'Неверный код';
      }
    });
  }

  // Подписка на состояние аутентификации (можно показать профиль/кнопку выхода)
  onAuthStateChanged(auth, user => {
    state.currentUser = user;
    // Здесь можно обновить UI (показать кнопку "Выйти" и имя)
    // Например: если пользователь есть — показать ссылку "Личный кабинет"
    const nav = document.querySelector('.app-nav');
    if (!nav) return;
    const exist = nav.querySelector('.profile-link');
    if (user) {
      if (!exist) {
        const a = document.createElement('a');
        a.href = '#profile';
        a.className = 'profile-link';
        a.textContent = user.phoneNumber || 'Профиль';
        nav.insertBefore(a, nav.querySelector('.button'));
      } else {
        exist.textContent = user.phoneNumber || 'Профиль';
      }
    } else {
      if (exist) exist.remove();
    }
  });

});
