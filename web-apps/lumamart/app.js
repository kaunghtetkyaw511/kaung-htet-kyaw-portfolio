const CART_KEY = "lumamart-cart-v1";
const WISHLIST_KEY = "lumamart-wishlist-v1";
const THEME_KEY = "lumamart-theme-v1";

const products = [
  {
    id: "sonic-hush",
    name: "Sonic Hush Headphones",
    category: "Audio",
    price: 189,
    oldPrice: 229,
    rating: 4.8,
    image: "assets/headphones.jpg",
    stock: 12,
    badge: "Sale",
    accent: "Matte black",
    description: "Noise-softening over-ear headphones tuned for deep work, travel, and clean calls.",
  },
  {
    id: "loop-watch",
    name: "Loop Smart Watch",
    category: "Wearables",
    price: 149,
    oldPrice: 0,
    rating: 4.7,
    image: "assets/smartwatch.jpg",
    stock: 9,
    badge: "",
    accent: "Cloud silver",
    description: "A lightweight activity watch with a woven strap, health tracking, and all-day battery.",
  },
  {
    id: "metro-pack",
    name: "Metro Commuter Pack",
    category: "Bags",
    price: 118,
    oldPrice: 148,
    rating: 4.6,
    image: "assets/backpack.jpg",
    stock: 7,
    badge: "Sale",
    accent: "Sand canvas",
    description: "Structured everyday backpack with laptop padding, smooth zips, and a weather-friendly shell.",
  },
  {
    id: "glow-desk",
    name: "Glow Desk Lamp",
    category: "Workspace",
    price: 84,
    oldPrice: 0,
    rating: 4.9,
    image: "assets/lamp.jpg",
    stock: 15,
    badge: "",
    accent: "Warm white",
    description: "Compact adjustable LED lamp with warm dimming for late work sessions and reading.",
  },
  {
    id: "studio-buds",
    name: "Studio Travel Headphones",
    category: "Audio",
    price: 164,
    oldPrice: 0,
    rating: 4.5,
    image: "assets/headphones.jpg",
    stock: 0,
    badge: "",
    accent: "Graphite",
    description: "Foldable wireless headphones with plush cushions and a travel-ready case.",
  },
  {
    id: "pulse-watch",
    name: "Pulse Fitness Watch",
    category: "Wearables",
    price: 132,
    oldPrice: 159,
    rating: 4.4,
    image: "assets/smartwatch.jpg",
    stock: 11,
    badge: "Sale",
    accent: "Stone grey",
    description: "Daily movement tracker with quick-glance notifications and a breathable sport strap.",
  },
  {
    id: "atlas-carry",
    name: "Atlas Day Backpack",
    category: "Bags",
    price: 96,
    oldPrice: 0,
    rating: 4.3,
    image: "assets/backpack.jpg",
    stock: 18,
    badge: "",
    accent: "Oat beige",
    description: "Slim day pack for city errands, campus notes, and a compact laptop setup.",
  },
  {
    id: "focus-lamp",
    name: "Focus Mini Lamp",
    category: "Workspace",
    price: 62,
    oldPrice: 78,
    rating: 4.6,
    image: "assets/lamp.jpg",
    stock: 6,
    badge: "Sale",
    accent: "Cream brass",
    description: "Small-space desk lamp with a soft glow, stable base, and one-touch brightness.",
  },
];

let cart = loadJSON(CART_KEY, []);
let wishlist = loadJSON(WISHLIST_KEY, []);
let appliedPromo = "";
let activeDialogProduct = null;

const els = {
  searchInput: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  sortSelect: document.querySelector("#sortSelect"),
  maxPrice: document.querySelector("#maxPrice"),
  priceLabel: document.querySelector("#priceLabel"),
  stockOnly: document.querySelector("#stockOnly"),
  clearFiltersBtn: document.querySelector("#clearFiltersBtn"),
  categoryChips: document.querySelector("#categoryChips"),
  productGrid: document.querySelector("#productGrid"),
  resultCount: document.querySelector("#resultCount"),
  themeBtn: document.querySelector("#themeBtn"),
  wishlistBtn: document.querySelector("#wishlistBtn"),
  wishlistCount: document.querySelector("#wishlistCount"),
  cartBtn: document.querySelector("#cartBtn"),
  cartCount: document.querySelector("#cartCount"),
  cartDrawer: document.querySelector("#cartDrawer"),
  closeCartBtn: document.querySelector("#closeCartBtn"),
  cartItems: document.querySelector("#cartItems"),
  promoInput: document.querySelector("#promoInput"),
  promoBtn: document.querySelector("#promoBtn"),
  dealBtn: document.querySelector("#dealBtn"),
  subtotalText: document.querySelector("#subtotalText"),
  discountText: document.querySelector("#discountText"),
  shippingText: document.querySelector("#shippingText"),
  totalText: document.querySelector("#totalText"),
  checkoutBtn: document.querySelector("#checkoutBtn"),
  productDialog: document.querySelector("#productDialog"),
  closeProductBtn: document.querySelector("#closeProductBtn"),
  dialogImage: document.querySelector("#dialogImage"),
  dialogCategory: document.querySelector("#dialogCategory"),
  dialogTitle: document.querySelector("#dialogTitle"),
  dialogDescription: document.querySelector("#dialogDescription"),
  dialogPrice: document.querySelector("#dialogPrice"),
  dialogRating: document.querySelector("#dialogRating"),
  dialogAddBtn: document.querySelector("#dialogAddBtn"),
  checkoutDialog: document.querySelector("#checkoutDialog"),
  checkoutForm: document.querySelector("#checkoutForm"),
  closeCheckoutBtn: document.querySelector("#closeCheckoutBtn"),
  toast: document.querySelector("#toast"),
};

init();

function init() {
  document.documentElement.dataset.theme = localStorage.getItem(THEME_KEY) || "light";
  bindEvents();
  renderCategoryChips();
  render();
}

function bindEvents() {
  els.searchInput.addEventListener("input", renderProducts);
  els.categoryFilter.addEventListener("change", () => {
    syncActiveChip();
    renderProducts();
  });
  els.sortSelect.addEventListener("change", renderProducts);
  els.maxPrice.addEventListener("input", () => {
    els.priceLabel.textContent = formatCurrency(Number(els.maxPrice.value));
    renderProducts();
  });
  els.stockOnly.addEventListener("change", renderProducts);
  els.clearFiltersBtn.addEventListener("click", clearFilters);
  els.themeBtn.addEventListener("click", toggleTheme);
  els.cartBtn.addEventListener("click", openCart);
  els.closeCartBtn.addEventListener("click", closeCart);
  els.wishlistBtn.addEventListener("click", showWishlist);
  els.promoBtn.addEventListener("click", applyPromoFromInput);
  els.dealBtn.addEventListener("click", () => applyPromo("LUMA10"));
  els.checkoutBtn.addEventListener("click", openCheckout);
  els.closeProductBtn.addEventListener("click", () => els.productDialog.close());
  els.dialogAddBtn.addEventListener("click", () => {
    if (activeDialogProduct) addToCart(activeDialogProduct.id);
  });
  els.closeCheckoutBtn.addEventListener("click", () => els.checkoutDialog.close());
  els.checkoutForm.addEventListener("submit", placeOrder);
}

function render() {
  renderProducts();
  renderCart();
  updateWishlistCount();
  refreshIcons();
}

function renderCategoryChips() {
  const categories = ["all", "Audio", "Wearables", "Bags", "Workspace"];
  els.categoryChips.innerHTML = categories
    .map((category) => `<button class="chip ${category === "all" ? "active" : ""}" data-category="${category}" type="button">${category === "all" ? "All" : category}</button>`)
    .join("");

  els.categoryChips.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      els.categoryFilter.value = chip.dataset.category;
      syncActiveChip();
      renderProducts();
    });
  });
}

function syncActiveChip() {
  els.categoryChips.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.category === els.categoryFilter.value);
  });
}

function renderProducts() {
  const visible = getVisibleProducts();
  els.resultCount.textContent = `${visible.length} ${visible.length === 1 ? "item" : "items"}`;
  els.productGrid.innerHTML = visible.length
    ? visible.map(renderProductCard).join("")
    : `<div class="empty-state">No products match your filters</div>`;

  els.productGrid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.add));
  });

  els.productGrid.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => openProduct(button.dataset.view));
  });

  els.productGrid.querySelectorAll("[data-wishlist]").forEach((button) => {
    button.addEventListener("click", () => toggleWishlist(button.dataset.wishlist));
  });

  refreshIcons();
}

function renderProductCard(product) {
  const disabled = product.stock <= 0;
  const isWishlisted = wishlist.includes(product.id);
  return `
    <article class="product-card">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${escapeHtml(product.name)}" />
        ${product.badge ? `<span class="sale-pill">${product.badge}</span>` : ""}
        <span class="stock-pill ${disabled ? "out" : ""}">${disabled ? "Sold out" : "In stock"}</span>
      </div>
      <div class="product-info">
        <div class="product-card-top">
          <h3>${escapeHtml(product.name)}</h3>
          <button class="icon-button wishlist-toggle ${isWishlisted ? "active" : ""}" type="button" data-wishlist="${product.id}" title="Toggle wishlist">
            <i data-lucide="heart"></i>
            <span class="sr-only">Toggle wishlist</span>
          </button>
        </div>
        <p class="product-desc">${escapeHtml(product.description)}</p>
        <div class="rating-row">
          <i data-lucide="star"></i>
          <strong>${product.rating.toFixed(1)}</strong>
          <span>${escapeHtml(product.accent)}</span>
        </div>
        <div class="product-meta">
          <div class="price-wrap">
            <strong>${formatCurrency(product.price)}</strong>
            ${product.oldPrice ? `<s>${formatCurrency(product.oldPrice)}</s>` : ""}
          </div>
        </div>
        <div class="card-actions">
          <button class="ghost-button" type="button" data-view="${product.id}">
            <i data-lucide="eye"></i>
            <span>View</span>
          </button>
          <button class="primary-button" type="button" data-add="${product.id}" ${disabled ? "disabled" : ""}>
            <i data-lucide="shopping-bag"></i>
            <span>${disabled ? "Sold out" : "Add"}</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

function getVisibleProducts() {
  const query = els.searchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  const maxPrice = Number(els.maxPrice.value);
  const stockOnly = els.stockOnly.checked;

  const filtered = products.filter((product) => {
    const matchesQuery = [product.name, product.category, product.description, product.accent].join(" ").toLowerCase().includes(query);
    const matchesCategory = category === "all" || product.category === category;
    const matchesPrice = product.price <= maxPrice;
    const matchesStock = !stockOnly || product.stock > 0;
    return matchesQuery && matchesCategory && matchesPrice && matchesStock;
  });

  return filtered.sort((a, b) => {
    if (els.sortSelect.value === "price-low") return a.price - b.price;
    if (els.sortSelect.value === "price-high") return b.price - a.price;
    if (els.sortSelect.value === "rating") return b.rating - a.rating;
    return Number(Boolean(b.badge)) - Number(Boolean(a.badge));
  });
}

function renderCart() {
  const cartProducts = cart.map((item) => ({ ...item, product: products.find((product) => product.id === item.id) })).filter((item) => item.product);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cartProducts.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const discount = appliedPromo === "LUMA10" ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal === 0 || subtotal >= 120 ? 0 : 12;
  const total = Math.max(subtotal - discount + shipping, 0);

  els.cartCount.textContent = itemCount;
  els.cartItems.innerHTML = cartProducts.length
    ? cartProducts
        .map(
          ({ product, qty }) => `
        <article class="cart-item">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" />
          <div>
            <div class="cart-item-top">
              <h3>${escapeHtml(product.name)}</h3>
              <button class="remove-btn" type="button" data-remove="${product.id}">Remove</button>
            </div>
            <div class="price-wrap"><strong>${formatCurrency(product.price)}</strong></div>
            <div class="qty-control" aria-label="Quantity controls">
              <button type="button" data-decrease="${product.id}">-</button>
              <strong>${qty}</strong>
              <button type="button" data-increase="${product.id}">+</button>
            </div>
          </div>
        </article>
      `
        )
        .join("")
    : `<div class="empty-state">Your cart is empty</div>`;

  els.subtotalText.textContent = formatCurrency(subtotal);
  els.discountText.textContent = `-${formatCurrency(discount)}`;
  els.shippingText.textContent = shipping === 0 ? "Free" : formatCurrency(shipping);
  els.totalText.textContent = formatCurrency(total);
  els.checkoutBtn.disabled = cartProducts.length === 0;

  els.cartItems.querySelectorAll("[data-increase]").forEach((button) => {
    button.addEventListener("click", () => changeQty(button.dataset.increase, 1));
  });
  els.cartItems.querySelectorAll("[data-decrease]").forEach((button) => {
    button.addEventListener("click", () => changeQty(button.dataset.decrease, -1));
  });
  els.cartItems.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(button.dataset.remove));
  });

  saveJSON(CART_KEY, cart);
  refreshIcons();
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product || product.stock <= 0) return;

  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty = Math.min(existing.qty + 1, product.stock);
  } else {
    cart.push({ id, qty: 1 });
  }

  renderCart();
  openCart();
  showToast(`${product.name} added to cart`);
}

function changeQty(id, delta) {
  const item = cart.find((entry) => entry.id === id);
  const product = products.find((entry) => entry.id === id);
  if (!item || !product) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }

  item.qty = Math.min(item.qty, product.stock);
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  renderCart();
}

function toggleWishlist(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  wishlist = wishlist.includes(id) ? wishlist.filter((item) => item !== id) : [...wishlist, id];
  saveJSON(WISHLIST_KEY, wishlist);
  updateWishlistCount();
  renderProducts();
  showToast(wishlist.includes(id) ? `${product.name} saved` : `${product.name} removed`);
}

function showWishlist() {
  if (!wishlist.length) {
    showToast("Wishlist is empty");
    return;
  }

  els.searchInput.value = "";
  els.categoryFilter.value = "all";
  els.stockOnly.checked = false;
  syncActiveChip();
  const names = wishlist.map((id) => products.find((product) => product.id === id)?.name).filter(Boolean).join(", ");
  showToast(`Wishlist: ${names}`);
}

function updateWishlistCount() {
  els.wishlistCount.textContent = wishlist.length;
}

function openProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  activeDialogProduct = product;
  els.dialogImage.src = product.image;
  els.dialogImage.alt = product.name;
  els.dialogCategory.textContent = product.category;
  els.dialogTitle.textContent = product.name;
  els.dialogDescription.textContent = product.description;
  els.dialogPrice.textContent = formatCurrency(product.price);
  els.dialogRating.textContent = `${product.rating.toFixed(1)} rating - ${product.accent}`;
  els.dialogAddBtn.disabled = product.stock <= 0;
  els.productDialog.showModal();
  refreshIcons();
}

function applyPromoFromInput() {
  applyPromo(els.promoInput.value.trim());
}

function applyPromo(code) {
  if (code.toUpperCase() !== "LUMA10") {
    appliedPromo = "";
    showToast("Promo code not found");
  } else {
    appliedPromo = "LUMA10";
    els.promoInput.value = "LUMA10";
    showToast("LUMA10 applied");
  }
  renderCart();
}

function openCart() {
  els.cartDrawer.classList.add("open");
}

function closeCart() {
  els.cartDrawer.classList.remove("open");
}

function openCheckout() {
  if (!cart.length) {
    showToast("Add an item before checkout");
    return;
  }
  els.checkoutDialog.showModal();
  refreshIcons();
}

function placeOrder(event) {
  event.preventDefault();
  const name = document.querySelector("#checkoutName").value.trim();
  cart = [];
  appliedPromo = "";
  saveJSON(CART_KEY, cart);
  els.checkoutDialog.close();
  closeCart();
  renderCart();
  showToast(`Demo order placed for ${name}`);
  els.checkoutForm.reset();
}

function clearFilters() {
  els.searchInput.value = "";
  els.categoryFilter.value = "all";
  els.sortSelect.value = "featured";
  els.maxPrice.value = "250";
  els.priceLabel.textContent = "$250";
  els.stockOnly.checked = false;
  syncActiveChip();
  renderProducts();
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);
}

function loadJSON(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let toastTimer = 0;
function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2400);
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
