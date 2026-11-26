// Login, cadastro e sessão com Firebase Authentication.
// Cada cadastro/login também grava o cliente em Firestore: coleção "clientes", documento = uid.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile,
  GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo,
  setPersistence, browserLocalPersistence, browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const configurado = firebaseConfig.apiKey && firebaseConfig.apiKey !== "COLE_AQUI";

const ERROS = {
  "auth/email-already-in-use": "Este e-mail já tem conta. Use a aba Entrar.",
  "auth/invalid-email": "E-mail inválido.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "Não existe conta com este e-mail.",
  "auth/too-many-requests": "Muitas tentativas. Espere alguns minutos e tente de novo.",
  "auth/popup-closed-by-user": "Janela do Google fechada antes de concluir.",
  "auth/network-request-failed": "Sem conexão. Verifique a internet.",
  "auth/unauthorized-domain": "Este domínio não está autorizado no Firebase."
};
const traduzErro = (e) => ERROS[e?.code] || "Não foi possível concluir. Tente novamente.";

function feedback(msg, tipo = "ok") {
  const fb = document.getElementById("authFeedback");
  if (!fb) return;
  fb.textContent = msg;
  fb.classList.remove("hidden");
  fb.classList.toggle("erro", tipo === "erro");
}

function carregando(form, ativo) {
  const btn = form?.querySelector('button[type="submit"]');
  if (!btn) return;
  if (ativo) { btn.dataset.texto = btn.textContent; btn.textContent = "Aguarde..."; btn.disabled = true; }
  else { btn.textContent = btn.dataset.texto || btn.textContent; btn.disabled = false; }
}

if (!configurado) {
  console.warn("[CapTei] Firebase não configurado: preencha firebase-config.js");
} else {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  auth.languageCode = "pt";

  // Grava/atualiza o cliente no Firestore
  async function salvarCliente(user, { novo = false, nome, provedor }) {
    const dados = {
      nome: nome || user.displayName || "",
      email: user.email,
      provedor,
      ultimoAcesso: serverTimestamp()
    };
    if (novo) dados.criadoEm = serverTimestamp();
    await setDoc(doc(db, "clientes", user.uid), dados, { merge: true });
  }

  // ---------- Página de login ----------
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.removeAttribute("onsubmit");
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const senha = document.getElementById("loginSenha").value;
      const lembrar = document.getElementById("loginLembrar")?.checked;
      carregando(loginForm, true);
      try {
        await setPersistence(auth, lembrar ? browserLocalPersistence : browserSessionPersistence);
        const { user } = await signInWithEmailAndPassword(auth, email, senha);
        await salvarCliente(user, { provedor: "email" });
        feedback(`Bem-vindo de volta, ${user.displayName || "cliente"}! Redirecionando...`);
        setTimeout(() => { window.location.href = "./index.html"; }, 1000);
      } catch (err) {
        feedback(traduzErro(err), "erro");
      } finally {
        carregando(loginForm, false);
      }
    });

    document.getElementById("forgotLink")?.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      if (!email) { feedback("Digite seu e-mail no campo acima e clique de novo.", "erro"); return; }
      try {
        await sendPasswordResetEmail(auth, email);
        feedback("Enviamos um link para redefinir a senha. Confira seu e-mail (e o spam).");
      } catch (err) {
        feedback(traduzErro(err), "erro");
      }
    });

    const googleBtn = document.getElementById("googleBtn");
    googleBtn?.removeAttribute("onclick");
    googleBtn?.addEventListener("click", async () => {
      try {
        const cred = await signInWithPopup(auth, new GoogleAuthProvider());
        const novo = getAdditionalUserInfo(cred)?.isNewUser;
        await salvarCliente(cred.user, { novo, provedor: "google" });
        feedback(`Olá, ${cred.user.displayName || "cliente"}! Redirecionando...`);
        setTimeout(() => { window.location.href = "./index.html"; }, 1000);
      } catch (err) {
        feedback(traduzErro(err), "erro");
      }
    });
  }

  if (registerForm) {
    registerForm.removeAttribute("onsubmit");
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const senha = document.getElementById("regSenha").value;
      carregando(registerForm, true);
      try {
        const { user } = await createUserWithEmailAndPassword(auth, email, senha);
        await updateProfile(user, { displayName: nome });
        await salvarCliente(user, { novo: true, nome, provedor: "email" });
        feedback(`Conta criada, ${nome}! Redirecionando...`);
        setTimeout(() => { window.location.href = "./index.html"; }, 1200);
      } catch (err) {
        feedback(traduzErro(err), "erro");
      } finally {
        carregando(registerForm, false);
      }
    });
  }

  // ---------- Menu: mostra quem está logado ----------
  onAuthStateChanged(auth, (user) => {
    document.querySelectorAll('a.icon-btn[href="login.html"], a.icon-btn[data-conta]').forEach((link) => {
      link.dataset.conta = "1";
      let sair = link.parentElement.querySelector(".conta-sair");
      if (user) {
        const primeiroNome = (user.displayName || user.email || "").split(/[ @]/)[0];
        link.title = `Logado como ${user.email}`;
        link.innerHTML = `👤 <span class="conta-nome">${primeiroNome}</span>`;
        link.setAttribute("href", "#");
        link.onclick = (e) => e.preventDefault();
        if (!sair) {
          sair = document.createElement("button");
          sair.type = "button";
          sair.className = "conta-sair";
          sair.textContent = "Sair";
          sair.addEventListener("click", () => signOut(auth));
          link.after(sair);
        }
      } else {
        link.title = "Entrar ou Criar conta";
        link.textContent = "👤";
        link.setAttribute("href", "login.html");
        link.onclick = null;
        sair?.remove();
      }
    });
  });
}
