// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDHU_KHVA5JezYLPed6Yg93fwCXUSa4qVc",
  authDomain: "streamplay-mvp.firebaseapp.com",
  databaseURL: "https://streamplay-mvp-default-rtdb.firebaseio.com",
  projectId: "streamplay-mvp",
  storageBucket: "streamplay-mvp.firebasestorage.app",
  messagingSenderId: "254252838564",
  appId: "1:254252838564:web:2100d6b3a40d7ac7ce0031"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 2. Estado local del Dashboard
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

// 3. Renderizado del Dashboard
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
      optionsContainer.innerHTML += `<button class="btn-option"><b>${opt.id}</b> — ${opt.text}</button>`;
    });
  }
}

// 4. ENVÍO DE DATOS A FIREBASE AL INICIAR PARTIDA
function startGame() {
  gameState.status = "question_active";
  renderUI(); // Actualiza el dashboard
  
  // Sobrescribe la base de datos en la sala "room_1"
  db.ref("salas/room_1").set(gameState);
}

// Iniciar estado por defecto (limpiar base de datos al recargar)
db.ref("salas/room_1").set(gameState);
renderUI();