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