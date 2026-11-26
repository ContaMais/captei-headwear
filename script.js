// GERADOR DE IMAGENS SVG EMBUTIDAS (Garante que os bonés e o modelo apareçam sem ficheiro partido)
function createCapSVG({ crown, brim, underbrim, monogram, flat = false }) {
  const brimPath = flat
    ? "M 54 148 Q 130 132 212 152 L 222 170 Q 134 152 46 164 Z"
    : "M 54 148 Q 112 168 186 154 L 194 172 Q 116 188 46 164 Z";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 220" width="100%" height="100%">
      <rect width="260" height="220" fill="#EAE7E1"/>
      <ellipse cx="128" cy="194" rx="74" ry="9" fill="#000" opacity="0.14"/>
      <path d="M 46 164 Q 116 188 194 172 L 188 164 Q 116 178 52 158 Z" fill="${underbrim}"/>
      <path d="${brimPath}" fill="${brim}"/>
      <path d="M 56 152 C 56 64, 104 34, 146 34 C 188 34, 212 68, 210 148 Q 132 136 56 152 Z" fill="${crown}"/>
      <circle cx="144" cy="34" r="5" fill="${crown}" stroke="#000" stroke-opacity="0.18"/>
      <path d="M 102 44 C 76 48, 72 78, 96 82 C 122 86, 178 52, 184 68 C 190 84, 126 102, 108 126 C 92 146, 114 166, 138 158 C 158 152, 160 124, 140 122 C 122 120, 118 142, 132 146"
            fill="none" stroke="${monogram}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function createModelSVG() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 520" width="100%" height="100%">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#DDD9D0"/>
          <stop offset="100%" stop-color="#C8C2B8"/>
        </linearGradient>
      </defs>
      <rect width="420" height="520" fill="url(#wall)"/>
      <rect x="28" y="34" width="364" height="120" rx="4" fill="#EFECE6" stroke="#C5BFB5"/>
      <path d="M 110 520 C 112 375, 148 332, 210 332 C 272 332, 308 375, 310 520 Z" fill="#161616"/>
      <path d="M 186 270 L 234 270 L 242 336 L 178 336 Z" fill="#A67552"/>
      <ellipse cx="212" cy="214" rx="54" ry="68" fill="#B5835E"/>
      <path d="M 152 178 C 152 114, 186 92, 224 92 C 262 92, 282 122, 280 176 Q 214 166 152 178 Z" fill="#F4F4F2"/>
      <path d="M 152 178 Q 204 196 266 184 L 272 197 Q 206 210 146 188 Z" fill="#F4F4F2"/>
      <path d="M 188 102 C 168 106, 166 128, 184 131 C 204 134, 248 108, 252 120 C 256 132, 206 146, 192 164 C 180 178, 196 192, 214 186 C 228 182, 230 162, 214 160"
            fill="none" stroke="#141414" stroke-width="10" stroke-linecap="round"/>
      <path d="M 122 440 Q 210 478 298 440 L 298 474 Q 210 512 122 474 Z" fill="#1F1F1F"/>
      <path d="M 122 406 Q 210 444 298 406 L 298 440 Q 210 478 122 440 Z" fill="#242424"/>
    </svg>
  `;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const IMG_VINHO  = createCapSVG({ crown: "#56161E", brim: "#56161E", underbrim: "#380D13", monogram: "#F4F4F2" });
const IMG_OLIVA  = createCapSVG({ crown: "#4E5835", brim: "#4E5835", underbrim: "#313821", monogram: "#DFD3B2" });
const IMG_PRETO  = createCapSVG({ crown: "#151515", brim: "#151515", underbrim: "#0A0A0A", monogram: "#F4F4F2", flat: true });
const IMG_BRANCO = createCapSVG({ crown: "#F4F4F2", brim: "#F4F4F2", underbrim: "#161616", monogram: "#141414" });
const IMG_MENINO = createModelSVG();

function attachImageFallback(imgEl, fallbackSrc) {
  if (!imgEl) return;
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = fallbackSrc;
  };
  if (!imgEl.complete || imgEl.naturalWidth === 0) {
    imgEl.src = fallbackSrc;
  }
}

const PRODUCTS = [
  { id: 1, name: "Signature Monogram C — Bordô", category: "Aba curva", color: "Vinho", price: 159.90, badge: "MAIS VENDIDO", localSrc: "img/bone-vinho.jpg", fallback: IMG_VINHO, featured: true },
  { id: 2, name: "Signature Monogram C — Oliva Militar", category: "Aba curva", color: "Verde Oliva", price: 159.90, badge: "NOVO DROP", localSrc: "img/bone-oliva.jpg", fallback: IMG_OLIVA, featured: true },
  { id: 3, name: "Signature Monogram C — White Edition", category: "Aba curva", color: "Branco", price: 159.90, badge: "EXCLUSIVO", localSrc: "img/modelo.jpg", fallback: IMG_BRANCO, featured: true },
  { id: 4, name: "Flat Brim Street C — Black Edition", category: "Aba reta", color: "Preto", price: 169.90, badge: "ABA RETA", localSrc: "img/bone-preto.jpg", fallback: IMG_PRETO, featured: true },
  { id: 5, name: "Runner Air Sport C — White/Black", category: "Esportivo", color: "Branco", price: 149.90, badge: "ESPORTIVO", localSrc: "img/modelo.jpg", fallback: IMG_BRANCO, featured: false },
  { id: 6, name: "Runner Air Sport C — Oliva", category: "Esportivo", color: "Verde Oliva", price: 149.90, badge: "ESPORTIVO", localSrc: "img/bone-oliva.jpg", fallback: IMG_OLIVA, featured: false },
  { id: 7, name: "Dad Hat Washed C — Vinho", category: "Dad hat", color: "Vinho", price: 139.90, badge: "CLÁSSICO", localSrc: "img/bone-vinho.jpg", fallback: IMG_VINHO, featured: false },
  { id: 8, name: "Snapback Origin — Vinho", category: "Aba reta", color: "Vinho", price: 169.90, badge: "ABA RETA", localSrc: "img/bone-vinho.jpg", fallback: IMG_VINHO, featured: false }
];

let cart = JSON.parse(localStorage.getItem("capesnc_cart")) || [];
let selectedCategory = "Todos";
let selectedColor = null;

function formatBRL(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function createProductCard(p) {
  return `
    <article class="product-card">
      <div class="product-img-wrap">
        <span class="product-badge">${p.badge}</span>
        <img src="${p.localSrc}" alt="${p.name}" onerror="this.onerror=null;this.src='${p.fallback}';" />
        <button class="add-quick-btn" onclick="addToCart(${p.id})">+ Sacola</button>
      </div>
      <span class="product-meta">${p.category} • ${p.color}</span>
      <h3 class="product-title">${p.name}</h3>
      <div class="product-price">${formatBRL(p.price)}</div>
      <span class="product-installments">ou 3x de ${formatBRL(p.price / 3)} sem juros</span>
    </article>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  attachImageFallback(document.getElementById("heroModelImg"), IMG_MENINO);
  attachImageFallback(document.getElementById("authModelImg"), IMG_MENINO);
  attachImageFallback(document.getElementById("catCurvaImg"), IMG_VINHO);
  attachImageFallback(document.getElementById("catRetaImg"), IMG_PRETO);
  attachImageFallback(document.getElementById("catEsportivoImg"), IMG_BRANCO);
  attachImageFallback(document.getElementById("catDadImg"), IMG_OLIVA);
  attachImageFallback(document.getElementById("manifestoImg"), IMG_OLIVA);

  updateCartUI();

  const featuredContainer = document.getElementById("featuredProducts");
  if (featuredContainer) {
    featuredContainer.innerHTML = PRODUCTS.filter(p => p.featured).map(createProductCard).join("");
  }

  const catalogGrid = document.getElementById("catalogGrid");
  if (catalogGrid) {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get("cat");
    if (catParam) setCategory(catParam);
    else applyFilters();
  }

  const authParams = new URLSearchParams(window.location.search);
  if (authParams.get("tab") === "register" && document.getElementById("tabRegister")) {
    switchAuthTab("register");
  }
});

function setCategory(cat) {
  selectedCategory = cat;
  document.querySelectorAll("#categoryPills .pill").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.cat === cat);
  });
  applyFilters();
}

function toggleColorFilter(color, el) {
  if (selectedColor === color) {
    selectedColor = null;
    el.classList.remove("selected");
  } else {
    document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
    selectedColor = color;
    el.classList.add("selected");
  }
  applyFilters();
}

function updatePriceLabel(val) {
  document.getElementById("priceValue").textContent = `R$ ${val}`;
  applyFilters();
}

function resetFilters() {
  selectedCategory = "Todos";
  selectedColor = null;
  if (document.getElementById("searchInput")) document.getElementById("searchInput").value = "";
  if (document.getElementById("priceRange")) document.getElementById("priceRange").value = 250;
  if (document.getElementById("priceValue")) document.getElementById("priceValue").textContent = "R$ 250";
  document.querySelectorAll(".model-filter").forEach(cb => cb.checked = false);
  document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
  setCategory("Todos");
}

function applyFilters() {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  const q = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const maxPrice = Number(document.getElementById("priceRange")?.value || 250);
  const sort = document.getElementById("sortSelect")?.value || "featured";
  const models = Array.from(document.querySelectorAll(".model-filter:checked")).map(cb => cb.value);

  let list = PRODUCTS.filter(p => {
    const okCat = selectedCategory === "Todos" || p.category === selectedCategory;
    const okModel = models.length === 0 || models.includes(p.category);
    const okColor = !selectedColor || p.color === selectedColor;
    const okPrice = p.price <= maxPrice;
    const okSearch = p.name.toLowerCase().includes(q) || p.color.toLowerCase().includes(q);
    return okCat && okModel && okColor && okPrice && okSearch;
  });

  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);

  document.getElementById("productCount").textContent = `A mostrar ${list.length} modelos`;
  grid.innerHTML = list.length ? list.map(createProductCard).join("") : "<p>Nenhum boné encontrado.</p>";
}

function toggleCart() {
  document.getElementById("cartDrawer").classList.toggle("open");
  document.getElementById("cartOverlay").classList.toggle("open");
}

function addToCart(id) {
  const prod = PRODUCTS.find(p => p.id === id);
  const found = cart.find(i => i.id === id);
  if (found) found.qty += 1;
  else cart.push({ ...prod, qty: 1 });
  localStorage.setItem("capesnc_cart", JSON.stringify(cart));
  updateCartUI();
  toggleCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem("capesnc_cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const badge = document.getElementById("cartBadge");
  const items = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("cartSubtotal");
  const ship = document.getElementById("shippingBar");

  const qty = cart.reduce((acc, i) => acc + i.qty, 0);
  const sub = cart.reduce((acc, i) => acc + i.price * i.qty, 0);

  if (badge) badge.textContent = qty;
  if (subtotalEl) subtotalEl.textContent = formatBRL(sub);
  if (ship) {
    const rest = 299 - sub;
    ship.innerHTML = rest > 0 ? `Faltam <strong>${formatBRL(rest)}</strong> para Portes Grátis` : `Parabéns! Tens <strong>Portes Grátis</strong>`;
  }
  if (items) {
    items.innerHTML = cart.length ? cart.map(i => `
      <div class="cart-item-row">
        <img src="${i.localSrc}" alt="${i.name}" onerror="this.onerror=null;this.src='${i.fallback}';" />
        <div style="flex:1">
          <strong style="font-size:14px;display:block;">${i.name}</strong>
          <span style="font-size:12px;color:#666;">Qtd: ${i.qty} • ${formatBRL(i.price)}</span><br>
          <button onclick="removeFromCart(${i.id})" style="background:none;border:none;color:#C84B31;font-size:12px;cursor:pointer;margin-top:4px;">Remover</button>
        </div>
      </div>
    `).join("") : "<p style='color:#666;font-size:14px;'>A tua sacola está vazia.</p>";
  }
}

function checkout() {
  if (!cart.length) return alert("Adiciona um boné à sacola primeiro!");
  alert("Encomenda CAPE SNC concluída com sucesso!");
  cart = [];
  localStorage.setItem("capesnc_cart", JSON.stringify(cart));
  updateCartUI();
  toggleCart();
}

// Mostrar/ocultar senha
function toggleSenha(btn) {
  const input = btn.parentElement.querySelector("input");
  const mostrar = input.type === "password";
  input.type = mostrar ? "text" : "password";
  btn.textContent = mostrar ? "Ocultar" : "Mostrar";
  btn.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
  input.focus();
}

// Limpa avisos e erros ao trocar de aba
function limparAvisosAuth() {
  const fb = document.getElementById("authFeedback");
  if (fb) { fb.textContent = ""; fb.classList.add("hidden"); fb.classList.remove("erro"); }
  document.querySelectorAll(".campo-erro").forEach((el) => el.classList.remove("campo-erro"));
}

function switchAuthTab(tab) {
  limparAvisosAuth();
  const loginForm = document.getElementById("loginForm");
  const regForm = document.getElementById("registerForm");
  const tLogin = document.getElementById("tabLogin");
  const tReg = document.getElementById("tabRegister");

  if (tab === "login") {
    loginForm.classList.remove("hidden");
    regForm.classList.add("hidden");
    tLogin.classList.add("active");
    tReg.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    regForm.classList.remove("hidden");
    tLogin.classList.remove("active");
    tReg.classList.add("active");
  }
}

function handleNewsletter(e) {
  e.preventDefault();
  alert("E-mail registado! Usa o código CAPESNC10 na tua primeira compra.");
  e.target.reset();
}