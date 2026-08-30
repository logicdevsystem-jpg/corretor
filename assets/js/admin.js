const listaImoveis = document.getElementById("lista-imoveis");

// Só roda esse código se estivermos na página do dashboard
if (listaImoveis) {

  function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function criarLinhaImovel(id, imovel) {
    const foto = (imovel.fotos && imovel.fotos.length > 0) ? imovel.fotos[0] : "";
    const statusClasse = imovel.status === "vendido" ? "status-vendido" : "status-disponivel";
    const statusTexto = imovel.status === "vendido" ? "Vendido" : "Disponível";

    return `
      <div class="imovel-linha">
        <img class="imovel-linha-foto" src="${foto}" alt="${imovel.titulo}">
        <div class="imovel-linha-info">
          <p class="imovel-linha-titulo">${imovel.titulo} - ${imovel.bairro}</p>
          <p class="imovel-linha-preco">${formatarPreco(imovel.preco)}</p>
        </div>
        <span class="status-badge ${statusClasse}">${statusTexto}</span>
        <div class="imovel-linha-acoes">
          <a href="imovel.html?id=${id}">Editar</a>
          <button onclick="excluirImovel('${id}')">Excluir</button>
        </div>
      </div>
    `;
  }

  function carregarImoveis() {
    db.collection("imoveis").orderBy("criadoEm", "desc").get().then((resultado) => {
      const total = resultado.size;
      let disponiveis = 0;
      let vendidos = 0;
      let html = "";

      resultado.forEach((doc) => {
        const imovel = doc.data();
        if (imovel.status === "vendido") vendidos++; else disponiveis++;
        html += criarLinhaImovel(doc.id, imovel);
      });

      document.getElementById("resumo-total").textContent = total;
      document.getElementById("resumo-disponiveis").textContent = disponiveis;
      document.getElementById("resumo-vendidos").textContent = vendidos;
      document.getElementById("lista-contagem").textContent = `${total} imóveis cadastrados`;

      listaImoveis.innerHTML = html || `<p style="padding:16px;">Nenhum imóvel cadastrado ainda.</p>`;
    }).catch((erro) => {
      console.error(erro);
      document.getElementById("lista-contagem").textContent = "Erro ao carregar imóveis.";
    });
  }

  function excluirImovel(id) {
    if (confirm("Tem certeza que deseja excluir este imóvel?")) {
      db.collection("imoveis").doc(id).delete().then(() => {
        carregarImoveis();
      });
    }
  }

  carregarImoveis();

}

// Reduz a foto automaticamente antes de enviar (corretor não precisa se preocupar com tamanho)
function comprimirImagem(arquivo, larguraMaxima = 1600, qualidade = 0.75) {
  return new Promise((resolve) => {
    const leitor = new FileReader();

    leitor.onload = (evento) => {
      const imagem = new Image();

      imagem.onload = () => {
        const canvas = document.createElement("canvas");
        let largura = imagem.width;
        let altura = imagem.height;

        if (largura > larguraMaxima) {
          altura = (altura * larguraMaxima) / largura;
          largura = larguraMaxima;
        }

        canvas.width = largura;
        canvas.height = altura;
        canvas.getContext("2d").drawImage(imagem, 0, 0, largura, altura);

        canvas.toBlob((blob) => {
          // Se por algum motivo a compressão falhar, usa o arquivo original
          resolve(blob || arquivo);
        }, "image/jpeg", qualidade);
      };

      // Se a imagem não puder ser lida (formato não suportado), usa o arquivo original
      imagem.onerror = () => resolve(arquivo);
      imagem.src = evento.target.result;
    };

    leitor.onerror = () => resolve(arquivo);
    leitor.readAsDataURL(arquivo);
  });
}

// ===== MÁSCARA DE PREÇO (formato R$ 350.000,00) =====
function formatarInputPreco(valorDigitado) {
  let somenteNumeros = valorDigitado.replace(/\D/g, "");
  if (!somenteNumeros) return "";
  somenteNumeros = somenteNumeros.replace(/^0+(?=\d)/, "").padStart(3, "0");
  const centavos = somenteNumeros.slice(-2);
  const inteiro = somenteNumeros.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${inteiro},${centavos}`;
}

function precoFormatadoParaNumero(valorFormatado) {
  if (!valorFormatado) return 0;
  return Number(valorFormatado.replace(/\./g, "").replace(",", "."));
}

function numeroParaPrecoFormatado(numero) {
  const centavos = Math.round(Number(numero || 0) * 100).toString();
  return formatarInputPreco(centavos);
}

// ===== FORMULÁRIO DE CADASTRAR/EDITAR IMÓVEL (admin/imovel.html) =====
const formImovel = document.getElementById("form-imovel");

if (formImovel) {
  const params = new URLSearchParams(window.location.search);
  const imovelId = params.get("id");

  const inputFotos = document.getElementById("input-fotos");
  const previewFotos = document.getElementById("preview-fotos");
  const inputPreco = document.getElementById("input-preco");
  const inputStatus = document.getElementById("input-status");
  const grupoVendidoAte = document.getElementById("grupo-vendido-ate");
  const inputVendidoAte = document.getElementById("input-vendido-ate");

  let fotosExistentes = [];
  let fotosExistentesRemovidas = [];

  // ---- Preview das fotos já salvas (edição) ----
  function renderizarFotosExistentes() {
    previewFotos.querySelectorAll(".preview-foto-existente").forEach((el) => el.remove());

    fotosExistentes.forEach((url, indice) => {
      const item = document.createElement("div");
      item.className = "preview-foto-item preview-foto-existente";
      item.innerHTML = `
        <img src="${url}" alt="Foto do imóvel">
        <button type="button" class="preview-foto-remover" title="Remover foto">&times;</button>
      `;
      item.querySelector(".preview-foto-remover").addEventListener("click", () => {
        fotosExistentesRemovidas.push(fotosExistentes[indice]);
        fotosExistentes = fotosExistentes.filter((_, i) => i !== indice);
        renderizarFotosExistentes();
      });
      previewFotos.appendChild(item);
    });
  }

  // ---- Preview das fotos recém-escolhidas ----
  if (inputFotos && previewFotos) {
    inputFotos.addEventListener("change", () => {
      previewFotos.querySelectorAll(".preview-foto-nova").forEach((el) => el.remove());

      Array.from(inputFotos.files).forEach((arquivo) => {
        const leitor = new FileReader();
        leitor.onload = (evento) => {
          const item = document.createElement("div");
          item.className = "preview-foto-item preview-foto-nova";
          item.innerHTML = `<img src="${evento.target.result}" alt="Nova foto selecionada">`;
          previewFotos.appendChild(item);
        };
        leitor.readAsDataURL(arquivo);
      });
    });
  }

  // ---- Mostra/esconde o campo "ocultar da vitrine em" ----
  function atualizarVisibilidadeVendidoAte() {
    if (!grupoVendidoAte) return;
    grupoVendidoAte.style.display = inputStatus.value === "vendido" ? "block" : "none";
  }

  if (inputStatus) {
    inputStatus.addEventListener("change", atualizarVisibilidadeVendidoAte);
    atualizarVisibilidadeVendidoAte();
  }

  // ---- Máscara do campo de preço ----
  if (inputPreco) {
    inputPreco.addEventListener("input", () => {
      inputPreco.value = formatarInputPreco(inputPreco.value);
    });
  }

  // ---- Se veio um ?id= na URL, é edição: carrega os dados do imóvel ----
  if (imovelId) {
    document.getElementById("form-titulo").textContent = "Editar imóvel";
    document.title = "Editar Imóvel - Painel do Corretor";

    db.collection("imoveis").doc(imovelId).get().then((doc) => {
      if (doc.exists) {
        const imovel = doc.data();
        document.getElementById("input-titulo").value = imovel.titulo;
        document.getElementById("input-bairro").value = imovel.bairro;
        inputPreco.value = numeroParaPrecoFormatado(imovel.preco);
        document.getElementById("input-categoria").value = imovel.categoria;
        inputStatus.value = imovel.status;
        document.getElementById("input-video").value = imovel.video || "";
        document.getElementById("input-descricao").value = imovel.descricao || "";
        if (inputVendidoAte) inputVendidoAte.value = imovel.vendidoAte || "";
        fotosExistentes = imovel.fotos || [];
        renderizarFotosExistentes();
        atualizarVisibilidadeVendidoAte();
      }
    });
  }

  formImovel.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnSalvar = document.getElementById("btn-salvar");
    const erroTexto = document.getElementById("imovel-erro");
    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";
    erroTexto.textContent = "";

    try {
      const arquivos = inputFotos.files;
      let urlsFotos = [...fotosExistentes];

      for (let i = 0; i < arquivos.length; i++) {
        const arquivoComprimido = await comprimirImagem(arquivos[i]);
        const caminho = `imoveis/${Date.now()}_${i}.jpg`;
        const ref = storage.ref(caminho);
        await ref.put(arquivoComprimido);
        const url = await ref.getDownloadURL();
        urlsFotos.push(url);
      }

      if (urlsFotos.length === 0) {
        erroTexto.textContent = "Escolha pelo menos uma foto do imóvel.";
        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar imóvel";
        return;
      }

      const dadosImovel = {
        titulo: document.getElementById("input-titulo").value,
        bairro: document.getElementById("input-bairro").value,
        preco: precoFormatadoParaNumero(inputPreco.value),
        categoria: document.getElementById("input-categoria").value,
        status: inputStatus.value,
        vendidoAte: inputStatus.value === "vendido" ? (inputVendidoAte.value || null) : null,
        video: document.getElementById("input-video").value,
        descricao: document.getElementById("input-descricao").value,
        fotos: urlsFotos
      };

      if (imovelId) {
        await db.collection("imoveis").doc(imovelId).update(dadosImovel);
      } else {
        dadosImovel.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection("imoveis").add(dadosImovel);
      }

      // Remove do Storage as fotos que o corretor excluiu na edição
      fotosExistentesRemovidas.forEach((url) => {
        try {
          storage.refFromURL(url).delete();
        } catch (erroRemocao) {
          console.warn("Não foi possível remover foto antiga:", erroRemocao);
        }
      });

      window.location.href = "dashboard.html";

    } catch (erro) {
      console.error(erro);
      erroTexto.textContent = "Erro ao salvar imóvel. Tente novamente.";
      btnSalvar.disabled = false;
      btnSalvar.textContent = "Salvar imóvel";
    }
  });
}