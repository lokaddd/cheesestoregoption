// app.js
import * as api from './api.js';
import * as cart from './cart.js';
import { auth } from './firebase.js';

window.addEventListener('DOMContentLoaded', async () => {
  const appRoot = document.getElementById('app-root');
  const state = { currentUser: null };

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
      '#catalog': renderer.renderCatalogPage,
      '#product': renderer.renderProductPage
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

  // ======= Global Click Handlers =======
  appRoot.addEventListener('click', e => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const { action, productId } = target.dataset;
    if (action === 'add-to-cart') cart.addToCart(productId);
  });
});
