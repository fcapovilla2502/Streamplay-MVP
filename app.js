// 1. INICIALIZAR FIREBASE (Versión 8 directa, sin "import")
const firebaseConfig = {
  apiKey: "AIzaSyDHU_KHVA5JezYLPed6Yg93fwCXUSa4qVc",
  authDomain: "streamplay-mvp.firebaseapp.com",
  databaseURL: "https://streamplay-mvp-default-rtdb.firebaseio.com",
  projectId: "streamplay-mvp",
  storageBucket: "streamplay-mvp.firebasestorage.app",
  messagingSenderId: "254252838564",
  appId: "1:254252838564:web:2100d6b3a40d7ac7ce0031"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 2. ESTADO LOCAL DEL DASHBOARD
let gameState = {
  status: "waiting_players",
  config: { title: "TRIVIA DEL GORDO" },
  current_state: {
    question_data: {
      text: "¿Cuál fue la primera consola de Sony?",
      options: [
        { id: "A", text: "PlayStation" },
        { id: "B", text: "Nintendo 64" },
        { id: "C", text: "Sega Saturn" },
        { id: "D", text: "Dreamcast" }
      ]
    }
  }
};

// 3. RENDERIZADO DEL DASHBOARD
function renderUI() {
  document.getElementById("screen-waiting").style.display = "none";
  document.getElementById("screen-question").style.display = "none";

  if (gameState.status === "waiting_players") {
    document.getElementById("screen-waiting").style.display = "block";
    document.getElementById("ui-title").innerText = gameState.config.title;
  } 
  else if (gameState.status === "question_active") {
    document.getElementById("screen-question").style.display = "block";
    document.getElementById("ui-question-text").innerText = gameState.current_state.question_data.text;
    
    const optionsContainer = document.getElementById("ui-options");
    optionsContainer.innerHTML = "";
    
    gameState.current_state.question_data.options.forEach(opt => {
      // Usamos onclick vacío por ahora, solo visual en el dashboard
      optionsContainer.innerHTML += `<button class="btn-option"><b>${opt.id}</b> — ${opt.text}</button>`;
    });
  }
}

// 4. ENVÍO DE DATOS A FIREBASE AL INICIAR PARTIDA
// Nota: La función debe llamarse exactamente igual que en el onclick de tu index.html
function startGame() {
  gameState.status = "question_active";
  renderUI(); 
  
  db.ref("salas/room_1").set(gameState);
}

// 5. ARRANQUE INICIAL
db.ref("salas/room_1").set(gameState);
renderUI();