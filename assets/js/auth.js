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

// ===== ALTERAR SENHA (dashboard.html) =====
// Por segurança, o Firebase exige reautenticar o corretor com a senha atual
// antes de permitir a troca para a nova senha.
const formSenha = document.getElementById("form-senha");

if (formSenha) {
  formSenha.addEventListener("submit", (e) => {
    e.preventDefault();

    const senhaAtual = document.getElementById("senha-atual").value;
    const senhaNova = document.getElementById("senha-nova").value;
    const erroTexto = document.getElementById("senha-erro");
    const sucessoTexto = document.getElementById("senha-sucesso");
    const btnSalvar = formSenha.querySelector("button[type='submit']");

    erroTexto.textContent = "";
    sucessoTexto.textContent = "";
    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    const usuario = auth.currentUser;

    if (!usuario) {
      erroTexto.textContent = "Sessão expirada. Faça login novamente.";
      btnSalvar.disabled = false;
      btnSalvar.textContent = "Salvar nova senha";
      return;
    }

    const credencial = firebase.auth.EmailAuthProvider.credential(usuario.email, senhaAtual);

    usuario.reauthenticateWithCredential(credencial)
      .then(() => usuario.updatePassword(senhaNova))
      .then(() => {
        sucessoTexto.textContent = "Senha alterada com sucesso!";
        formSenha.reset();
      })
      .catch((erro) => {
        if (erro.code === "auth/wrong-password") {
          erroTexto.textContent = "Senha atual incorreta.";
        } else if (erro.code === "auth/weak-password") {
          erroTexto.textContent = "A nova senha precisa ter pelo menos 6 caracteres.";
        } else if (erro.code === "auth/too-many-requests") {
          erroTexto.textContent = "Muitas tentativas. Aguarde um pouco e tente novamente.";
        } else {
          erroTexto.textContent = "Erro ao alterar senha. Tente novamente.";
        }
      })
      .finally(() => {
        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar nova senha";
      });
  });
}