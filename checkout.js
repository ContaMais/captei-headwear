// Finalizar pedido: janela com entrega + pagamento (SIMULADO) e gravação no Firestore (coleção "pedidos").
// O dono vê todos os pedidos no Console do Firebase > Firestore Database > pedidos.
// Dados de cartão NUNCA são enviados: só os 4 últimos dígitos e as parcelas.
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const FRETE = 19.9;
const FRETE_GRATIS = 299;
const MAX_PARCELAS = 6;

let auth = null;
let db = null;
try {
  const app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("[CapTei] Firebase indisponível para pedidos:", e?.message);
}

const so = (v) => String(v || "").replace(/\D/g, "");
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------- Avisos no carrinho (sem popup) ----------
function avisoCarrinho(msg) {
  const footer = document.querySelector(".cart-footer");
  if (!footer) return;
  footer.querySelector(".cart-aviso")?.remove();
  const el = document.createElement("div");
  el.className = "cart-aviso";
  el.textContent = msg;
  footer.prepend(el);
  setTimeout(() => el.remove(), 4500);
}

// ---------- Totais ----------
function totais() {
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const frete = subtotal >= FRETE_GRATIS || subtotal === 0 ? 0 : FRETE;
  return { subtotal, frete, total: subtotal + frete };
}

// ---------- Códigos de demonstração ----------
function qrFalso() {
  const n = 25, c = 6;
  let x = 20251127, r = "";
  const rnd = () => ((x = (x * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const canto = (i < 7 && j < 7) || (i < 7 && j >= n - 7) || (i >= n - 7 && j < 7);
      let on;
      if (canto) {
        const a = i < 7 ? i : i - (n - 7);
        const b = j < 7 ? j : j - (n - 7);
        on = a === 0 || a === 6 || b === 0 || b === 6 || (a >= 2 && a <= 4 && b >= 2 && b <= 4);
      } else on = rnd() > 0.5;
      if (on) r += `<rect x="${j * c}" y="${i * c}" width="${c}" height="${c}"/>`;
    }
  }
  return `<svg viewBox="0 0 ${n * c} ${n * c}" width="150" height="150" aria-label="QR Code de demonstração" fill="#181818">${r}</svg>`;
}
const pixCodigo = (numero) => `00020126SIMULACAO-CAPTEI-${numero}-NAO-PAGAVEL5204000053039865802BR`;
const boletoCodigo = (numero) => `00000.00000 00000.000000 00000.${numero} 0 00000000000000`;

// ---------- Modal ----------
function fechar() {
  document.getElementById("coOverlay")?.remove();
  document.body.classList.remove("co-aberto");
}

function abrir(user) {
  fechar();
  const t = totais();
  const itens = cart.map((i) => `
    <div class="co-item">
      <img src="${esc(i.localSrc)}" alt="" onerror="this.onerror=null;this.src='${esc(i.fallback)}';" />
      <div><strong>${esc(i.name)}</strong><span>Qtd: ${i.qty} • ${formatBRL(i.price)}</span></div>
      <b>${formatBRL(i.price * i.qty)}</b>
    </div>`).join("");
  const parcelas = Array.from({ length: MAX_PARCELAS }, (_, k) => {
    const n = k + 1;
    return `<option value="${n}">${n}x de ${formatBRL(t.total / n)} sem juros</option>`;
  }).join("");

  const ov = document.createElement("div");
  ov.id = "coOverlay";
  ov.className = "co-overlay";
  ov.innerHTML = `
    <div class="co-modal" role="dialog" aria-modal="true" aria-label="Finalizar pedido">
      <button type="button" class="co-fechar" id="coFechar" aria-label="Fechar">✕</button>
      <form id="coForm" novalidate>
        <h2>Finalizar pedido</h2>
        <p class="co-sim">Simulação: nenhum pagamento real é feito.</p>

        <h3>1. Seus dados e entrega</h3>
        <div class="co-row">
          <div class="form-group"><label>Nome completo</label><input id="coNome" autocomplete="name" /></div>
          <div class="form-group"><label>Telefone / WhatsApp</label><input id="coTel" inputmode="tel" autocomplete="tel" placeholder="(11) 99999-9999" /></div>
        </div>
        <div class="co-row">
          <div class="form-group"><label>CEP</label><input id="coCep" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000" maxlength="9" /><small id="coCepMsg"></small></div>
          <div class="form-group"><label>Cidade / UF</label><input id="coCidade" autocomplete="address-level2" /></div>
        </div>
        <div class="form-group"><label>Rua</label><input id="coRua" autocomplete="address-line1" /></div>
        <div class="co-row">
          <div class="form-group"><label>Número</label><input id="coNum" inputmode="numeric" /></div>
          <div class="form-group"><label>Complemento (opcional)</label><input id="coComp" /></div>
        </div>
        <div class="form-group"><label>Bairro</label><input id="coBairro" /></div>

        <h3>2. Forma de pagamento</h3>
        <div class="co-pags">
          <label class="co-pag"><input type="radio" name="coPag" value="pix" checked /> <span>Pix</span></label>
          <label class="co-pag"><input type="radio" name="coPag" value="cartao" /> <span>Cartão de crédito</span></label>
          <label class="co-pag"><input type="radio" name="coPag" value="boleto" /> <span>Boleto</span></label>
        </div>
        <div class="co-painel" id="coPix"><p>O QR Code e o código "copia e cola" aparecem depois de confirmar o pedido.</p></div>
        <div class="co-painel hidden" id="coCartao">
          <p class="co-alerta">⚠ Simulação. Não digite os dados do seu cartão real. Use 4242 4242 4242 4242, qualquer validade futura e CVV 123.</p>
          <div class="form-group"><label>Número do cartão</label><input id="coCartaoNum" inputmode="numeric" autocomplete="off" placeholder="4242 4242 4242 4242" maxlength="23" /></div>
          <div class="form-group"><label>Nome impresso no cartão</label><input id="coCartaoNome" autocomplete="off" /></div>
          <div class="co-row">
            <div class="form-group"><label>Validade</label><input id="coCartaoVal" inputmode="numeric" autocomplete="off" placeholder="MM/AA" maxlength="5" /></div>
            <div class="form-group"><label>CVV</label><input id="coCartaoCvv" inputmode="numeric" autocomplete="off" placeholder="123" maxlength="4" /></div>
          </div>
          <div class="form-group"><label>Parcelas</label><select id="coParcelas">${parcelas}</select></div>
        </div>
        <div class="co-painel hidden" id="coBoleto"><p>O boleto de demonstração aparece depois de confirmar o pedido.</p></div>

        <h3>3. Resumo</h3>
        <div class="co-itens">${itens}</div>
        <div class="co-linha"><span>Subtotal</span><span>${formatBRL(t.subtotal)}</span></div>
        <div class="co-linha"><span>Frete</span><span>${t.frete ? formatBRL(t.frete) : "Grátis"}</span></div>
        <div class="co-linha co-total"><span>Total</span><span>${formatBRL(t.total)}</span></div>

        <div class="auth-feedback erro hidden" id="coErro" role="alert"></div>
        <button type="submit" class="btn-terracotta w-100" id="coBtn">Confirmar pedido · ${formatBRL(t.total)}</button>
      </form>
      <div id="coOk" class="co-ok hidden"></div>
    </div>`;
  document.body.appendChild(ov);
  document.body.classList.add("co-aberto");

  const $ = (id) => document.getElementById(id);
  $("coNome").value = user.displayName || "";
  $("coFechar").onclick = fechar;
  ov.addEventListener("mousedown", (e) => { if (e.target === ov && !ov.dataset.salvando) fechar(); });

  // Troca de forma de pagamento
  ov.querySelectorAll('input[name="coPag"]').forEach((r) =>
    r.addEventListener("change", () => {
      const m = ov.querySelector('input[name="coPag"]:checked').value;
      $("coPix").classList.toggle("hidden", m !== "pix");
      $("coCartao").classList.toggle("hidden", m !== "cartao");
      $("coBoleto").classList.toggle("hidden", m !== "boleto");
      limparErro();
    }));

  // Máscaras
  $("coTel").addEventListener("input", (e) => {
    const d = so(e.target.value).slice(0, 11);
    e.target.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  });
  $("coCartaoNum").addEventListener("input", (e) => {
    e.target.value = so(e.target.value).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  });
  $("coCartaoVal").addEventListener("input", (e) => {
    const d = so(e.target.value).slice(0, 4);
    e.target.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  });
  $("coCartaoCvv").addEventListener("input", (e) => { e.target.value = so(e.target.value).slice(0, 4); });

  // CEP -> ViaCEP
  $("coCep").addEventListener("input", async (e) => {
    const d = so(e.target.value).slice(0, 8);
    e.target.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
    const msg = $("coCepMsg");
    msg.textContent = "";
    if (d.length !== 8) return;
    msg.textContent = "Buscando endereço...";
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = await r.json();
      if (j.erro) throw new Error("CEP não encontrado");
      $("coRua").value = j.logradouro || $("coRua").value;
      $("coBairro").value = j.bairro || $("coBairro").value;
      $("coCidade").value = j.localidade && j.uf ? `${j.localidade} / ${j.uf}` : $("coCidade").value;
      msg.textContent = "✓ Endereço encontrado";
      $("coNum").focus();
    } catch {
      msg.textContent = "Não achei o CEP. Preencha o endereço à mão.";
    }
  });

  ov.querySelectorAll("input, select").forEach((el) => el.addEventListener("input", () => { el.classList.remove("campo-erro"); }));

  function limparErro() {
    const er = $("coErro");
    er.classList.add("hidden");
    er.textContent = "";
  }
  function mostrarErro(msg, campo) {
    const er = $("coErro");
    er.textContent = msg;
    er.classList.remove("hidden");
    if (campo) { campo.classList.add("campo-erro"); campo.focus(); }
    else er.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  // Identificador criado uma vez: se a primeira tentativa demorar, a segunda não duplica o pedido
  const pedidoRef = doc(collection(db, "pedidos"));
  const numero = String(Math.floor(100000 + Math.random() * 900000));
  let timeoutAntes = false;

  $("coForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErro();
    ov.querySelectorAll(".campo-erro").forEach((el) => el.classList.remove("campo-erro"));

    const nome = $("coNome").value.trim();
    const tel = so($("coTel").value);
    const cep = so($("coCep").value);
    const cidadeUf = $("coCidade").value.trim();
    const rua = $("coRua").value.trim();
    const num = $("coNum").value.trim();
    const bairro = $("coBairro").value.trim();
    const metodo = ov.querySelector('input[name="coPag"]:checked').value;

    if (nome.split(/\s+/).filter(Boolean).length < 2) return mostrarErro("Digite seu nome completo.", $("coNome"));
    if (tel.length < 10) return mostrarErro("Digite um telefone com DDD.", $("coTel"));
    if (cep.length !== 8) return mostrarErro("Digite um CEP com 8 números.", $("coCep"));
    if (!rua) return mostrarErro("Digite a rua.", $("coRua"));
    if (!num) return mostrarErro("Digite o número.", $("coNum"));
    if (!bairro) return mostrarErro("Digite o bairro.", $("coBairro"));
    if (!cidadeUf) return mostrarErro("Digite a cidade.", $("coCidade"));

    const pagamento = { metodo };
    if (metodo === "cartao") {
      const n = so($("coCartaoNum").value);
      const val = $("coCartaoVal").value;
      const mm = Number(val.slice(0, 2)), aa = Number(val.slice(3, 5));
      const agora = new Date();
      if (n.length < 13) return mostrarErro("Número do cartão incompleto.", $("coCartaoNum"));
      if (!$("coCartaoNome").value.trim()) return mostrarErro("Digite o nome impresso no cartão.", $("coCartaoNome"));
      if (!/^\d\d\/\d\d$/.test(val) || mm < 1 || mm > 12 || 2000 + aa < agora.getFullYear() || (2000 + aa === agora.getFullYear() && mm < agora.getMonth() + 1))
        return mostrarErro("Validade inválida ou vencida.", $("coCartaoVal"));
      if (so($("coCartaoCvv").value).length < 3) return mostrarErro("CVV inválido.", $("coCartaoCvv"));
      pagamento.parcelas = Number($("coParcelas").value);
      pagamento.ultimos4 = n.slice(-4); // número completo e CVV nunca saem desta página
      pagamento.status = "aprovado_simulado";
    } else {
      pagamento.status = "aguardando_pagamento_simulado";
    }

    const t2 = totais();
    const pedido = {
      uid: user.uid,
      numero,
      cliente: { nome, email: user.email || "", telefone: tel },
      itens: cart.map((i) => ({ id: i.id, nome: i.name, categoria: i.category, cor: i.color, preco: i.price, qtd: i.qty })),
      subtotal: t2.subtotal,
      frete: t2.frete,
      total: t2.total,
      endereco: { cep, rua, numero: num, complemento: $("coComp").value.trim(), bairro, cidadeUf },
      pagamento,
      status: "novo",
      criadoEm: serverTimestamp()
    };

    const btn = $("coBtn");
    btn.disabled = true;
    btn.textContent = "Enviando pedido...";
    ov.dataset.salvando = "1";
    try {
      await Promise.race([
        setDoc(pedidoRef, pedido),
        new Promise((_, rej) => setTimeout(() => rej({ code: "timeout" }), 15000))
      ]);
      concluir(metodo, t2.total);
    } catch (err) {
      console.error("[CapTei] Falha ao salvar pedido:", err?.code, err);
      if (err?.code === "permission-denied" && timeoutAntes) {
        concluir(metodo, t2.total); // a tentativa anterior chegou ao banco
        return;
      }
      if (err?.code === "timeout") timeoutAntes = true;
      delete ov.dataset.salvando;
      btn.disabled = false;
      btn.textContent = `Confirmar pedido · ${formatBRL(t2.total)}`;
      mostrarErro(
        err?.code === "permission-denied"
          ? "Pedido recusado pelo servidor. Saia e entre de novo na sua conta e tente outra vez."
          : "Não foi possível enviar o pedido agora. Nada foi cobrado. Verifique a internet e tente de novo."
      );
    }
  });

  function concluir(metodo, total) {
    delete ov.dataset.salvando;
    cart = [];
    localStorage.setItem("capesnc_cart", JSON.stringify(cart));
    updateCartUI();
    if (document.getElementById("cartDrawer")?.classList.contains("open")) toggleCart();

    let extra = "";
    if (metodo === "pix") {
      extra = `<div class="co-codigo">${qrFalso()}
        <p>Pix copia e cola (demonstração):</p><code>${esc(pixCodigo(numero))}</code></div>`;
    } else if (metodo === "boleto") {
      extra = `<div class="co-codigo"><p>Linha digitável (demonstração):</p><code>${esc(boletoCodigo(numero))}</code></div>`;
    }
    const msgPag = metodo === "cartao" ? "Pagamento no cartão aprovado (simulação)." : "Aguardando pagamento (simulação).";
    $("coForm").classList.add("hidden");
    const ok = $("coOk");
    ok.classList.remove("hidden");
    ok.innerHTML = `
      <div class="co-ok-icone">✓</div>
      <h2>Pedido recebido!</h2>
      <p class="co-ok-num">Pedido nº <strong>${numero}</strong> · ${formatBRL(total)}</p>
      <p>${msgPag}</p>
      ${extra}
      <p class="co-sim">Simulação: nenhum valor foi cobrado.</p>
      <button type="button" class="btn-terracotta w-100" id="coOkFechar">Voltar à loja</button>`;
    document.getElementById("coOkFechar").onclick = fechar;
    document.querySelector(".co-modal").scrollTop = 0;
  }
}

// ---------- Botão "Finalizar Compra" do carrinho ----------
window.checkout = async function checkout() {
  if (!cart.length) return avisoCarrinho("Sua sacola está vazia. Adicione um boné primeiro.");
  if (!auth || !db) return avisoCarrinho("Pedidos indisponíveis no momento. Tente mais tarde.");
  await auth.authStateReady();
  if (!auth.currentUser) {
    window.location.href = "login.html?voltar=finalizar";
    return;
  }
  abrir(auth.currentUser);
};

// Volta do login direto para o pedido
if (auth && location.hash === "#finalizar") {
  auth.authStateReady().then(() => {
    history.replaceState(null, "", location.pathname + location.search);
    if (auth.currentUser && cart.length) abrir(auth.currentUser);
  });
}
