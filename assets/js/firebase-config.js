// Cole aqui os valores que o Firebase te deu no passo 3
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpWSDZ40Mw7020MqXTfDhoC61VxVJiHpc",
  authDomain: "imobiliaria-62536.firebaseapp.com",
  projectId: "imobiliaria-62536",
  storageBucket: "imobiliaria-62536.firebasestorage.app",
  messagingSenderId: "732217173042",
  appId: "1:732217173042:web:0916e0121791178f2b882b",
  measurementId: "G-P3HKLDPMQQ"
};

firebase.initializeApp(firebaseConfig);

// Esses 3 são usados pelos outros arquivos (app.js, admin.js, auth.js)
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Cidades e bairros atendidos pelo corretor (usado no filtro da one page e no cadastro do admin)
const BAIRROS_POR_CIDADE = {
  "Aracaju": [
    "Aeroporto", "América", "Atalaia", "Aruana", "Bugio", "Capucho", "Centro",
    "Cirurgia", "Coroa do Meio", "Farolândia", "Getúlio Vargas", "Grageru",
    "Inácio Barbosa", "Industrial", "Jabotiana", "Jardins", "José Conrado de Araújo",
    "Lamarão", "Luzia", "Mosqueiro", "Novo Paraíso", "Olaria", "Palestina",
    "Pereira Lobo", "Ponto Novo", "Porto Dantas", "Salgado Filho", "Santa Maria",
    "Santo Antônio", "Santos Dumont", "São Conrado", "São José", "Siqueira Campos",
    "Soledade", "Suíssa", "Treze de Julho"
  ],
  "Nossa Senhora do Socorro": [
    "Bugio", "Centro", "Conjunto Governador João Alves Filho", "Distrito Industrial",
    "Marcos Freire I", "Marcos Freire II", "Marcos Freire III", "Palestina",
    "Parque dos Faróis", "Piabeta", "Taiçoca de Dentro", "Taiçoca de Fora"
  ],
  "Barra dos Coqueiros": [
    "Alphaville", "Antônio Pedro", "Atalaia Nova", "Baixo", "Beira Rio",
    "Brisas de Atalaia", "Caminho da Praia", "Centro", "Costa Paradiso",
    "Espaço Tropical", "Governador Marcelo Déda", "Luar da Barra", "Marivan",
    "Moisés Gomes", "Olimar", "Paraíso da Barra", "Prisco Viana", "Quintas da Barra",
    "Rio das Canas", "Serigy", "Zona de Expansão (Capuã)"
  ]
};