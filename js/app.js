/* Marine Pump Shop — WhatsApp/Email Ordering App with Cart
   Loads config.json + products.json and renders a searchable, filterable
   catalog. Customers can select multiple models/variants per product with
   individual quantities, add them all to a persistent cart, then check out
   the entire cart in one consolidated WhatsApp or Email message.
*/

(function () {
  "use strict";

  const CART_STORAGE_KEY = "marinePumpShopCart";

  let CONFIG = {};
  let PRODUCTS = [];
  let CATEGORIES = [];
  let activeFilter = "__all__";
  let searchTerm = "";
  let currentProduct = null;
  let cart = []; // { productId, title, subcategory, brand, model, note, qty }

  const el = (id) => document.getElementById(id);

  /* ---------------- Data loading ---------------- */

  async function loadData() {
    const [configRes, productsRes] = await Promise.all([
      fetch("data/config.json"),
      fetch("data/products.json"),
    ]);
    if (!configRes.ok || !productsRes.ok) {
      throw new Error(
        `Failed to load data (config: ${configRes.status}, products: ${productsRes.status})`
      );
    }
    CONFIG = await configRes.json();
    PRODUCTS = await productsRes.json();
    buildCategoryIndex();
  }

  function showLoadError(err) {
    const grid = el("productGrid");
    const isFileProtocol = window.location.protocol === "file:";
    grid.innerHTML = `
      <div class="no-results" style="max-width:600px;margin:0 auto;">
        <h3 style="color:#c0392b;">⚠️ Products failed to load</h3>
        <p>${
          isFileProtocol
            ? "You're viewing this page directly from a local file. Browsers block product data from loading this way for security reasons."
            : "The product data could not be loaded (" + escapeHtml(err.message) + ")."
        }</p>
        <p><b>Fix:</b> ${
          isFileProtocol
            ? "Run a local web server (e.g. <code>python3 -m http.server 8000</code>) or view the site via GitHub Pages."
            : "Check that <code>data/products.json</code> and <code>data/config.json</code> exist at the correct path."
        }</p>
      </div>
    `;
    el("resultsMeta").textContent = "";
  }

  function buildCategoryIndex() {
    const map = new Map();
    PRODUCTS.forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, new Set());
      map.get(p.category).add(p.subcategory);
    });
    CATEGORIES = Array.from(map.entries()).map(([category, subSet]) => ({
      category,
      subcategories: Array.from(subSet),
    }));
  }

  function applyConfig() {
    document.title = CONFIG.storeName || document.title;
    el("storeName").textContent = CONFIG.storeName || "Marine Pump Shop";
    el("storeTagline").textContent = CONFIG.tagline || "";
    if (CONFIG.logo) el("logoImg").src = CONFIG.logo;
  }

  /* ---------------- Cart persistence ---------------- */

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      cart = raw ? JSON.parse(raw) : [];
    } catch (e) {
      cart = [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      /* ignore storage errors (e.g. private browsing quota) */
    }
  }

  function cartLineKey(productId, model) {
    return `${productId}::${model}`;
  }

  function addLinesToCart(lines) {
    lines.forEach((line) => {
      const key = cartLineKey(line.productId, line.model);
      const existing = cart.find(
        (c) => cartLineKey(c.productId, c.model) === key
      );
      if (existing) {
        existing.qty += line.qty;
      } else {
        cart.push(line);
      }
    });
    saveCart();
    updateCartCount();
  }

  function removeCartLine(productId, model) {
    cart = cart.filter(
      (c) => cartLineKey(c.productId, c.model) !== cartLineKey(productId, model)
    );
    saveCart();
    updateCartCount();
    renderCart();
  }

  function updateCartLineQty(productId, model, qty) {
    const line = cart.find(
      (c) => cartLineKey(c.productId, c.model) === cartLineKey(productId, model)
    );
    if (!line) return;
    if (qty <= 0) {
      removeCartLine(productId, model);
      return;
    }
    line.qty = qty;
    saveCart();
    updateCartCount();
    renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
  }

  function totalCartItems() {
    return cart.reduce((sum, c) => sum + c.qty, 0);
  }

  function updateCartCount() {
    el("cartCount").textContent = totalCartItems();
  }

  /* ---------------- Category nav & product grid ---------------- */

  function renderCategoryNav() {
    const nav = el("categoryNav");
    nav.innerHTML = "";

    const allBtn = document.createElement("button");
    allBtn.textContent = "All Products";
    allBtn.dataset.filter = "__all__";
    allBtn.className = activeFilter === "__all__" ? "active" : "";
    nav.appendChild(allBtn);

    CATEGORIES.forEach((catGroup) => {
      catGroup.subcategories.forEach((sub) => {
        const btn = document.createElement("button");
        btn.textContent = sub;
        btn.dataset.filter = sub;
        btn.className = activeFilter === sub ? "active" : "";
        nav.appendChild(btn);
      });
    });

    nav.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      renderCategoryNav();
      renderGrid();
    });
  }

  function getFilteredProducts() {
    return PRODUCTS.filter((p) => {
      const matchesFilter =
        activeFilter === "__all__" || p.subcategory === activeFilter;
      if (!matchesFilter) return false;

      if (!searchTerm) return true;
      const haystack = [
        p.title,
        p.brand,
        p.subcategory,
        p.category,
        p.description,
        ...(p.specifications || []),
        ...(p.models || []).map((m) => `${m.model} ${m.note}`),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });
  }

  function renderGrid() {
    const grid = el("productGrid");
    const products = getFilteredProducts();

    el("resultsMeta").textContent = `${products.length} product${
      products.length === 1 ? "" : "s"
    } ${activeFilter === "__all__" ? "" : `in "${activeFilter}"`} — verified current on Xylem.com`;

    grid.innerHTML = "";

    if (products.length === 0) {
      grid.innerHTML = `<div class="no-results">No products match your search. Try a different keyword or category.</div>`;
      return;
    }

    products.forEach((p) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${p.image}" alt="${escapeHtml(p.title)}" loading="lazy">
        <div class="card-body">
          <div class="subcat-tag">${escapeHtml(p.subcategory)}</div>
          <h3>${escapeHtml(p.title)}${p.isNewProduct ? '<span class="badge-new">New</span>' : ""}</h3>
          <p class="brand">${escapeHtml(p.brand || "")}</p>
          <p class="card-desc">${escapeHtml(p.description)}</p>
          <span class="view-btn">View details &amp; order &rarr;</span>
        </div>
      `;
      card.addEventListener("click", () => openModal(p));
      grid.appendChild(card);
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* ---------------- Product modal with multi-model selection ---------------- */

  function openModal(product) {
    currentProduct = product;
    el("modalImage").src = product.image;
    el("modalImage").alt = product.title;
    el("modalBreadcrumb").textContent = `${product.category} / ${product.subcategory}`;
    el("modalTitle").textContent = product.title;
    el("modalBrand").textContent = product.brand ? `Brand: ${product.brand}` : "";
    el("modalDescription").textContent = product.description;

    const specsEl = el("modalSpecs");
    specsEl.innerHTML = (product.specifications || [])
      .map((s) => `<li>${escapeHtml(s)}</li>`)
      .join("");

    renderModelSelect(product);

    const xylemLink = el("modalXylemLink");
    if (product.xylemUrl) {
      xylemLink.href = product.xylemUrl;
      xylemLink.style.display = "";
    } else {
      xylemLink.style.display = "none";
    }

    el("addCartFeedback").textContent = "";

    el("modalOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function renderModelSelect(product) {
    const container = el("modalModelSelect");
    const models = (product.models && product.models.length)
      ? product.models
      : [{ model: product.title, note: "" }];

    container.innerHTML = models
      .map((m, idx) => `
        <div class="model-select-row" data-model="${escapeHtml(m.model)}" data-note="${escapeHtml(m.note || "")}">
          <div class="model-info">
            <div class="model-name">${escapeHtml(m.model)}</div>
            ${m.note ? `<div class="model-note">${escapeHtml(m.note)}</div>` : ""}
          </div>
          <div class="qty-stepper">
            <button type="button" class="qty-dec" aria-label="Decrease quantity">&minus;</button>
            <input type="number" class="qty-input" min="0" value="0" data-idx="${idx}">
            <button type="button" class="qty-inc" aria-label="Increase quantity">+</button>
          </div>
        </div>
      `)
      .join("");

    container.querySelectorAll(".qty-dec").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = btn.parentElement.querySelector(".qty-input");
        input.value = Math.max(0, (parseInt(input.value, 10) || 0) - 1);
      });
    });
    container.querySelectorAll(".qty-inc").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = btn.parentElement.querySelector(".qty-input");
        input.value = (parseInt(input.value, 10) || 0) + 1;
      });
    });
    container.querySelectorAll(".qty-input").forEach((input) => {
      input.addEventListener("change", () => {
        input.value = Math.max(0, parseInt(input.value, 10) || 0);
      });
    });
  }

  function handleAddToCart() {
    if (!currentProduct) return;
    const rows = el("modalModelSelect").querySelectorAll(".model-select-row");
    const lines = [];

    rows.forEach((row) => {
      const qty = parseInt(row.querySelector(".qty-input").value, 10) || 0;
      if (qty <= 0) return;
      lines.push({
        productId: currentProduct.id,
        title: currentProduct.title,
        subcategory: currentProduct.subcategory,
        brand: currentProduct.brand || "",
        model: row.dataset.model,
        note: row.dataset.note,
        qty,
      });
    });

    if (lines.length === 0) {
      el("addCartFeedback").textContent = "Please select a quantity for at least one model.";
      el("addCartFeedback").style.color = "#c0392b";
      return;
    }

    addLinesToCart(lines);
    el("addCartFeedback").style.color = "#16a34a";
    el("addCartFeedback").textContent = `Added ${lines.length} item${lines.length === 1 ? "" : "s"} to cart ✓`;

    // Reset quantities back to 0 after adding
    el("modalModelSelect").querySelectorAll(".qty-input").forEach((input) => {
      input.value = 0;
    });
  }

  function closeModal() {
    el("modalOverlay").classList.remove("open");
    document.body.style.overflow = "";
    currentProduct = null;
  }

  /* ---------------- Cart drawer ---------------- */

  function openCart() {
    renderCart();
    el("cartOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    el("cartOverlay").classList.remove("open");
    document.body.style.overflow = "";
  }

  function renderCart() {
    const itemsEl = el("cartItems");

    if (cart.length === 0) {
      itemsEl.innerHTML = `<div class="cart-empty">Your cart is empty. Browse products and add models/variants to get started.</div>`;
      el("cartSummary").textContent = "";
      updateCartLinks();
      return;
    }

    itemsEl.innerHTML = cart
      .map((c) => `
        <div class="cart-line" data-product-id="${escapeHtml(c.productId)}" data-model="${escapeHtml(c.model)}">
          <div class="cart-line-info">
            <p class="cart-line-title">${escapeHtml(c.title)}</p>
            <p class="cart-line-model">${escapeHtml(c.model)}</p>
            ${c.note ? `<p class="cart-line-note">${escapeHtml(c.note)}</p>` : ""}
          </div>
          <div class="cart-line-controls">
            <div class="qty-stepper">
              <button type="button" class="qty-dec" aria-label="Decrease quantity">&minus;</button>
              <input type="number" class="qty-input" min="0" value="${c.qty}">
              <button type="button" class="qty-inc" aria-label="Increase quantity">+</button>
            </div>
            <button class="cart-line-remove" aria-label="Remove item">&times;</button>
          </div>
        </div>
      `)
      .join("");

    itemsEl.querySelectorAll(".cart-line").forEach((lineEl) => {
      const productId = lineEl.dataset.productId;
      const model = lineEl.dataset.model;
      const qtyInput = lineEl.querySelector(".qty-input");

      lineEl.querySelector(".qty-dec").addEventListener("click", () => {
        updateCartLineQty(productId, model, (parseInt(qtyInput.value, 10) || 0) - 1);
      });
      lineEl.querySelector(".qty-inc").addEventListener("click", () => {
        updateCartLineQty(productId, model, (parseInt(qtyInput.value, 10) || 0) + 1);
      });
      qtyInput.addEventListener("change", () => {
        updateCartLineQty(productId, model, parseInt(qtyInput.value, 10) || 0);
      });
      lineEl.querySelector(".cart-line-remove").addEventListener("click", () => {
        removeCartLine(productId, model);
      });
    });

    const totalItems = totalCartItems();
    const totalLines = cart.length;
    el("cartSummary").innerHTML = `<b>${totalItems}</b> item${totalItems === 1 ? "" : "s"} across <b>${totalLines}</b> model${totalLines === 1 ? "" : "s"}/variant${totalLines === 1 ? "" : "s"}`;

    updateCartLinks();
  }

  function buildCartMessage() {
    if (cart.length === 0) return "";
    const lines = [
      `Hello, I'd like to place the following order:`,
      ``,
    ];
    cart.forEach((c, idx) => {
      lines.push(
        `${idx + 1}. ${c.title} — ${c.model}${c.note ? ` (${c.note})` : ""} — Qty: ${c.qty}`
      );
    });
    lines.push(``);
    lines.push(`Total items: ${totalCartItems()}`);
    lines.push(``);
    lines.push(`Please confirm price and availability for all items above. Thank you!`);
    return lines.join("\n");
  }

  function updateCartLinks() {
    const message = buildCartMessage();
    const encoded = encodeURIComponent(message);

    const waNumber = (CONFIG.whatsappNumber || "").replace(/[^0-9]/g, "");
    el("cartWhatsappBtn").href = cart.length
      ? `https://wa.me/${waNumber}?text=${encoded}`
      : "#";

    const email = CONFIG.orderEmail || "";
    const subject = encodeURIComponent(`Order Request — ${totalCartItems()} item(s)`);
    el("cartEmailBtn").href = cart.length
      ? `mailto:${email}?subject=${subject}&body=${encoded}`
      : "#";
  }

  /* ---------------- Event wiring ---------------- */

  function initEvents() {
    el("modalClose").addEventListener("click", closeModal);
    el("modalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "modalOverlay") closeModal();
    });
    el("addToCartBtn").addEventListener("click", handleAddToCart);

    el("cartBtn").addEventListener("click", openCart);
    el("cartClose").addEventListener("click", closeCart);
    el("cartOverlay").addEventListener("click", (e) => {
      if (e.target.id === "cartOverlay") closeCart();
    });
    el("clearCartBtn").addEventListener("click", () => {
      if (cart.length && confirm("Clear all items from your cart?")) {
        clearCart();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        closeCart();
      }
    });

    let debounceTimer;
    el("searchInput").addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchTerm = e.target.value.trim();
        renderGrid();
      }, 150);
    });
  }

  /* ---------------- Init ---------------- */

  async function init() {
    initEvents();
    loadCart();
    updateCartCount();
    try {
      await loadData();
      applyConfig();
      renderCategoryNav();
      renderGrid();
    } catch (err) {
      console.error("Marine Pump Shop failed to initialize:", err);
      showLoadError(err);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
