// app.js
import * as api from './api.js';
import * as cart from './cart.js';
import { auth } from './firebase.js';

window.addEventListener('DOMContentLoaded', () => {

window.addEventListener('DOMContentLoaded', async () => {
  const appRoot = document.getElementById('app-root');
  const authLinkEl = document.getElementById('auth-link');
  const mobileAuthLinkEl = document.getElementById('mobile-auth-link');
  
  const state = {
    currentUser: null,
  };
  
  const state = { currentUser: null };

  cart.loadCart();

  const renderer = {
    render(templateId) {
        const template = document.getElementById(templateId);
        if (!template) {
            appRoot.innerHTML = `<p>Ошибка: Шаблон #${templateId} не найден.</p>`;
            return;
        }
        appRoot.innerHTML = '';
        appRoot.appendChild(template.content.cloneNode(true));
    },
    updateHeader() {
        if(state.currentUser) {
            authLinkEl.textContent = 'Профиль';
            authLinkEl.href = '#profile';
            mobileAuthLinkEl.textContent = 'Профиль';
            mobileAuthLinkEl.href = '#profile';
        } else {
            authLinkEl.textContent = 'Войти';
            authLinkEl.href = '#login';
            mobileAuthLinkEl.textContent = 'Войти';
            mobileAuthLinkEl.href = '#login';
        }
      const tpl = document.getElementById(templateId);
      if (!tpl) {
        appRoot.innerHTML = `<p>Ошибка: шаблон #${templateId} не найден</p>`;
        return;
      }
      appRoot.innerHTML = '';
      appRoot.appendChild(tpl.content.cloneNode(true));
    },
    
    async renderHomePage() { renderer.render('home-page-template'); },
    async renderAboutPage() { renderer.render('about-page-template'); },
    async renderContactsPage() { renderer.render('contacts-page-template'); },
    
    async renderCatalogPage() {
        renderer.render('catalog-page-template');
        const products = await api.getProducts();
        const grid = document.getElementById('product-grid');
        if(!grid) return;
        if(products.length === 0) {
            grid.innerHTML = '<p>Товары скоро появятся!</p>';
            return;
        }
        grid.innerHTML = products.map(p => `
            <a href="#product/${p.id}" class="product-card">
                <img src="${p.imageUrl}" alt="${p.name}" class="product-card-image">
                <div class="product-card-content">
                    <h3 class="product-card-name">${p.name}</h3>
                    <p class="product-card-desc">${p.description.substring(0, 70)}...</p>
                    <div class="product-card-footer">
                        <span class="product-card-price">${p.price} ₽</span>
                        <button class="product-card-button" data-action="add-to-cart" data-product-id="${p.id}">В корзину</button>
                    </div>
                </div>
            </a>
        `).join('');
      renderer.render('catalog-page-template');
      const products = await api.getProducts();
      const grid = document.getElementById('product-grid');
      if(!grid) return;
      grid.innerHTML = products.map(p => `
        <a href="#product/${p.id}" class="product-card">
          <img src="${p.imageUrl}" alt="${p.name}" class="product-card-image">
          <div class="product-card-content">
            <h3 class="product-card-name">${p.name}</h3>
            <p class="product-card-desc">${p.description.substring(0, 70)}...</p>
            <div class="product-card-footer">
              <span class="product-card-price">${p.price} ₽</span>
              <button class="product-card-button" data-action="add-to-cart" data-product-id="${p.id}">В корзину</button>
            </div>
          </div>
        </a>
      `).join('');
    },

    async renderProductPage(id) {
        const product = await api.getProductById(Number(id));
        if (!product) {
            appRoot.innerHTML = '<p>Товар не найден.</p>';
            return;
        }
        renderer.render('product-page-template');
        document.querySelector('.product-detail-image').src = product.imageUrl;
        document.querySelector('.product-detail-image').alt = product.name;
        document.querySelector('.product-detail-name').textContent = product.name;
        document.querySelector('.product-detail-desc').textContent = product.description;
        document.querySelector('.product-detail-price').textContent = `${product.price} ₽`;
        document.querySelector('.product-detail-button').dataset.productId = product.id;
    },
    
    async renderAuthPage() {
        if(state.currentUser) {
            window.location.hash = '#profile';
            return;
        }
        renderer.render('auth-page-template');
    },

    async renderCartPage() {
        renderer.render('cart-page-template');
        const container = document.getElementById('cart-items-container');
        const summaryContainer = document.getElementById('cart-summary');
        const products = await api.getProducts();
        const cartItems = cart.getCartItems();

        if(!container) return;

        if(cartItems.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <p class="empty-cart-text">Ваша корзина пуста.</p>
                    <a href="#catalog" class="button">К покупкам</a>
                </div>
            `;
            if (summaryContainer) summaryContainer.innerHTML = '';
            return;
        }

        container.innerHTML = cartItems.map(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) return '';
            return `
                <div class="cart-item">
                    <img src="${product.imageUrl}" alt="${product.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <p class="cart-item-name">${product.name}</p>
                        <p class="cart-item-price">${product.price} ₽</p>
                    </div>
                    <div class="cart-item-quantity">
                        <input type="number" min="1" value="${item.quantity}" data-product-id="${item.id}" data-action="update-quantity">
                    </div>
                    <p class="cart-item-total">${product.price * item.quantity} ₽</p>
                    <button class="cart-item-remove" data-product-id="${item.id}" data-action="remove-from-cart">&times;</button>
                </div>
            `;
        }).join('');

        if(summaryContainer) {
            const total = await cart.getCartTotal();
            summaryContainer.innerHTML = `
                <p class="cart-summary-total">Итого: <span>${total} ₽</span></p>
                <button id="checkout-button" class="button checkout-button">Оформить заказ</button>
            `;
        }
    },

    async renderProfilePage() {
        if(!state.currentUser) {
            window.location.hash = '#login';
            return;
        }
        renderer.render('profile-page-template');
        document.getElementById('profile-username').textContent = state.currentUser.username;
        const orders = await api.getOrdersByUserId(state.currentUser.id);
        const historyContainer = document.getElementById('order-history');
        if (historyContainer) {
            if(orders.length > 0) {
                historyContainer.innerHTML = orders.reverse().map(order => `
                    <div class="order-history-item">
                        <p><strong>Заказ №${order.id}</strong> от ${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>Сумма: ${order.totalAmount} ₽</p>
                        <p>Статус: ${order.status}</p>
                    </div>
                `).join('');
            } else {
                 historyContainer.innerHTML = `<p>У вас еще нет заказов.</p>`;
            }
        }
    },

    async renderOrderSuccessPage() {
        renderer.render('order-success-template');
      const product = await api.getProductById(id);
      if (!product) { appRoot.innerHTML = '<p>Товар не найден</p>'; return; }
      renderer.render('product-page-template');
      document.querySelector('.product-detail-name').textContent = product.name;
      document.querySelector('.product-detail-desc').textContent = product.description;
      document.querySelector('.product-detail-price').textContent = `${product.price} ₽`;
    }
  };

  // ======= Router =======
  const router = {
    routes: {
      '': renderer.renderHomePage,
      '#': renderer.renderHomePage,
      '#about': renderer.renderAboutPage,
      '#catalog': renderer.renderCatalogPage,
      '#product': renderer.renderProductPage,
      '#contacts': renderer.renderContactsPage,
      '#login': renderer.renderAuthPage,
      '#cart': renderer.renderCartPage,
      '#profile': renderer.renderProfilePage,
      '#order-success': renderer.renderOrderSuccessPage,
      '#product': renderer.renderProductPage
    },
    
    handle() {
      const hash = window.location.hash || '#';
      const [path, param] = hash.split('/');
      const handler = this.routes[path] || this.routes[''];
      if (handler) {
          handler(param);
          window.scrollTo(0,0);
      } else {
          renderer.renderHomePage();
      }
      if (handler) handler(param);
    }
  };

  const handlers = {
    handleGlobalClick(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        
        const { action, productId } = target.dataset;

        if (action) e.preventDefault();
        
        if (action === 'add-to-cart') {
            cart.addToCart(Number(productId));
        }
        if (action === 'remove-from-cart') {
            cart.removeFromCart(Number(productId));
            renderer.renderCartPage();
        }
    },
    handleGlobalInput(e) {
        const target = e.target.closest('[data-action]');
        if (!target || target.dataset.action !== 'update-quantity') return;
        const { productId } = target.dataset;
        const quantity = parseInt(target.value, 10);
        cart.updateCartQuantity(Number(productId), quantity);
        renderer.renderCartPage();
    },
    async handleCheckout() {
        if(!state.currentUser) {
            alert('Пожалуйста, войдите или зарегистрируйтесь, чтобы оформить заказ.');
            window.location.hash = '#login';
            return;
        }
        if(cart.getCartItems().length === 0) {
            alert('Ваша корзина пуста.');
            return;
        }

        const orderData = {
            userId: state.currentUser.id,
            items: cart.getCartItems(),
            totalAmount: await cart.getCartTotal(),
            status: 'В обработке',
            createdAt: new Date().toISOString()
        };

        await api.createOrder(orderData);
        cart.clearCart();
        window.location.hash = '#order-success';
    },
    handleLogout() {
        state.currentUser = null;
        sessionStorage.removeItem('currentUser');
        renderer.updateHeader();
        window.location.hash = '#';
    },
    async handleLogin(e) {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const errorEl = document.getElementById('login-error');
        if(errorEl) errorEl.textContent = '';
        try {
            const user = await api.loginUser({email, password});
            state.currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            renderer.updateHeader();
            window.location.hash = '#profile';
        } catch (err) {
            if(errorEl) errorEl.textContent = err.message;
        }
    },
    async handleRegister(e) {
        e.preventDefault();
        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const errorEl = document.getElementById('register-error');
        if(errorEl) errorEl.textContent = '';
        try {
            const user = await api.registerUser({username, email, password});
            state.currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            renderer.updateHeader();
            window.location.hash = '#profile';
        } catch (err) {
            if(errorEl) errorEl.textContent = err.message;
        }
    },
    setupMobileMenu() {
        const burgerMenu = document.querySelector('[data-role="BurgerMenu"]');
        const mobileMenu = document.querySelector('[data-role="MobileMenu"]');
        const closeMenu = document.querySelector('[data-role="CloseMobileMenu"]');
        const mobileNavLinks = mobileMenu.querySelectorAll('a');

        burgerMenu.addEventListener('click', () => mobileMenu.classList.add('mobile-menu--open'));
        closeMenu.addEventListener('click', () => mobileMenu.classList.remove('mobile-menu--open'));
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.remove('mobile-menu--open'));
        });
    }
  };

  async function init() {
    await api.initApi();
    cart.loadCart();
    
    const userJson = sessionStorage.getItem('currentUser');
    if(userJson) {
        state.currentUser = JSON.parse(userJson);
    }

    renderer.updateHeader();
    handlers.setupMobileMenu();
    
    window.addEventListener('hashchange', () => router.handle());
    router.handle();

    appRoot.addEventListener('click', handlers.handleGlobalClick);
    appRoot.addEventListener('input', handlers.handleGlobalInput);

    appRoot.addEventListener('submit', (e) => {
        if (e.target.id === 'login-form') handlers.handleLogin(e);
        if (e.target.id === 'register-form') handlers.handleRegister(e);
    });

    appRoot.addEventListener('click', (e) => {
        if (e.target.id === 'logout-button') handlers.handleLogout();
        if (e.target.id === 'checkout-button') handlers.handleCheckout();
    });
  }
  window.addEventListener('hashchange', () => router.handle());
  router.handle();

  init();
  // ======= Global Click Handlers =======
  appRoot.addEventListener('click', e => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const { action, productId } = target.dataset;
    if (action === 'add-to-cart') cart.addToCart(productId);
  });
});
