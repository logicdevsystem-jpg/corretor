// ===== TELA DE LOGIN (admin/index.html) =====
const formLogin = document.getElementById("form-login");

if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("input-email").value;
    const senha = document.getElementById("input-senha").value;
    const erroTexto = document.getElementById("login-erro");

    auth.signInWithEmailAndPassword(email, senha)
      .then(() => {
        window.location.href = "dashboard.html";
      })
      .catch(() => {
        erroTexto.textContent = "E-mail ou senha incorretos.";
      });
  });
}

// ===== PROTEGE AS OUTRAS PÁGINAS DO ADMIN =====
// Se a página NÃO tem o formulário de login, é dashboard.html ou imovel.html.
// Aqui a gente verifica se o corretor está logado; se não estiver, manda de volta pro login.
if (!formLogin) {
  auth.onAuthStateChanged((usuario) => {
    if (!usuario) {
      window.location.href = "index.html";
    }
  });
}

// ===== LOGOUT =====
// Usado pelo botão "Sair" no dashboard.html
function fazerLogout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}