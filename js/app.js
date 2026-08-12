/* Marine Pump Shop — WhatsApp/Email Ordering App
   Loads config.json + products.json and renders a searchable, filterable
   catalog with a WhatsApp / Email order flow per product.
   Every product entry is verified against a live Xylem.com product page
   (see xylemUrl field) — see data/RECONCILIATION_LOG.md for methodology.
*/

(function () {
  "use strict";

  let CONFIG = {};
  let PRODUCTS = [];
  let CATEGORIES = [];
  let activeFilter = "__all__";
  let searchTerm = "";
  let currentProduct = null;

  const el = (id) => document.getElementById(id);

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
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

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

    const modelsEl = el("modalModels");
    const modelsHeading = el("modalModelsHeading");
    if (product.models && product.models.length) {
      modelsHeading.style.display = "";
      modelsEl.style.display = "";
      modelsEl.innerHTML = product.models
        .map((m) => `<li><b>${escapeHtml(m.model)}</b> — ${escapeHtml(m.note)}</li>`)
        .join("");
    } else {
      modelsHeading.style.display = "none";
      modelsEl.style.display = "none";
    }

    const xylemLink = el("modalXylemLink");
    if (product.xylemUrl) {
      xylemLink.href = product.xylemUrl;
      xylemLink.style.display = "";
    } else {
      xylemLink.style.display = "none";
    }

    el("qtyInput").value = 1;
    updateOrderLinks();

    el("modalOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    el("modalOverlay").classList.remove("open");
    document.body.style.overflow = "";
    currentProduct = null;
  }

  function buildOrderMessage() {
    if (!currentProduct) return "";
    const qty = el("qtyInput").value || 1;
    const lines = [
      `Hello, I'd like to order the following product:`,
      ``,
      `Product: ${currentProduct.title}`,
      `Brand: ${currentProduct.brand || "N/A"}`,
      `Category: ${currentProduct.category} / ${currentProduct.subcategory}`,
      `Quantity: ${qty}`,
      ``,
      `Please confirm price and availability. Thank you!`,
    ];
    return lines.join("\n");
  }

  function updateOrderLinks() {
    const message = buildOrderMessage();
    const encoded = encodeURIComponent(message);

    const waNumber = (CONFIG.whatsappNumber || "").replace(/[^0-9]/g, "");
    el("whatsappOrderBtn").href = `https://wa.me/${waNumber}?text=${encoded}`;

    const email = CONFIG.orderEmail || "";
    const subject = encodeURIComponent(
      `Order Request: ${currentProduct ? currentProduct.title : ""}`
    );
    el("emailOrderBtn").href = `mailto:${email}?subject=${subject}&body=${encoded}`;
  }

  function initEvents() {
    el("modalClose").addEventListener("click", closeModal);
    el("modalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "modalOverlay") closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
    el("qtyInput").addEventListener("input", updateOrderLinks);

    let debounceTimer;
    el("searchInput").addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchTerm = e.target.value.trim();
        renderGrid();
      }, 150);
    });
  }

  async function init() {
    initEvents();
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
