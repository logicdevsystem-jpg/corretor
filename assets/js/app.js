// Número de WhatsApp do corretor (troque pelo real, sem espaços, com código do país)
const numeroWhatsapp = "5579981196565"; // (79) 9 8119-6565
document.getElementById("btn-whatsapp").href =
  `https://wa.me/${numeroWhatsapp}?text=Olá! Vi seu site e quero saber mais sobre os imóveis.`;

// Formata número em Real (R$)
function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// Decide se um imóvel deve aparecer na vitrine (regra do "vendido com tempo programado")
function deveExibirImovel(imovel) {
  if (imovel.status !== "vendido") return true;

  // Vendido sem data programada = some da vitrine imediatamente
  if (!imovel.vendidoAte) return false;

  // Vendido com data programada = continua aparecendo (com a tag "Vendido") até aquele dia
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataLimite = new Date(`${imovel.vendidoAte}T00:00:00`);
  return hoje < dataLimite;
}

// Cria o HTML de um card de imóvel
function criarCardImovel(imovel) {
  const fotoPrincipal = (imovel.fotos && imovel.fotos.length > 0)
    ? imovel.fotos[0]
    : "assets/images/sem-foto.png";

  const vendidoTag = imovel.status === "vendido"
    ? `<span class="imovel-card-vendido">Vendido</span>`
    : "";

  return `
    <div class="imovel-card">
      <img src="${fotoPrincipal}" alt="${imovel.titulo}">
      <div class="imovel-card-info">
        <span class="imovel-card-categoria">${imovel.categoria}</span>
        <h3 class="imovel-card-titulo">${imovel.titulo} - ${imovel.bairro}</h3>
        <p class="imovel-card-preco">${formatarPreco(imovel.preco)}</p>
        ${vendidoTag}
      </div>
    </div>
  `;
}

// Busca os imóveis no Firestore e mostra na tela
function carregarImoveis() {
  const container = document.getElementById("imoveis-lista");

  db.collection("imoveis")
    .orderBy("criadoEm", "desc")
    .get()
    .then((resultado) => {
      if (resultado.empty) {
        container.innerHTML = `<p class="imoveis-carregando">Nenhum imóvel cadastrado ainda.</p>`;
        return;
      }

      let html = "";
      resultado.forEach((doc) => {
        const imovel = doc.data();
        if (deveExibirImovel(imovel)) {
          html += criarCardImovel(imovel);
        }
      });

      container.innerHTML = html || `<p class="imoveis-carregando">Nenhum imóvel disponível no momento.</p>`;
    })
    .catch((erro) => {
      console.error("Erro ao carregar imóveis:", erro);
      container.innerHTML = `<p class="imoveis-carregando">Não foi possível carregar os imóveis agora.</p>`;
    });
}

carregarImoveis();