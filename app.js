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
      ],
      correct_answer_id: "A" // <-- Agregado para saber cuál iluminar
    }
  }
};

function renderUI() {
  document.getElementById("screen-waiting").style.display = "none";
  document.getElementById("screen-question").style.display = "none";

  if (gameState.status === "waiting_players") {
    document.getElementById("screen-waiting").style.display = "block";
    document.getElementById("ui-title").innerText = gameState.config.title;
  } 
  else if (gameState.status === "question_active" || gameState.status === "time_up") {
    document.getElementById("screen-question").style.display = "block";
    document.getElementById("ui-question-text").innerText = gameState.current_state.question_data.text;
    
    const optionsContainer = document.getElementById("ui-options");
    optionsContainer.innerHTML = "";
    
    gameState.current_state.question_data.options.forEach(opt => {
      let extraStyle = "";
      // Si el tiempo terminó, iluminamos la respuesta correcta en verde en tu tablero
      if (gameState.status === "time_up" && opt.id === gameState.current_state.question_data.correct_answer_id) {
        extraStyle = "background: rgba(0, 255, 0, 0.15); border-color: #00FF00;";
      }
      optionsContainer.innerHTML += `<button class="btn-option" style="${extraStyle}"><b>${opt.id}</b> — ${opt.text}</button>`;
    });

    // Alternar qué botón de control se muestra
    if (gameState.status === "question_active") {
      document.getElementById("btn-stop").style.display = "block";
      document.getElementById("btn-lobby").style.display = "none";
    } else {
      document.getElementById("btn-stop").style.display = "none";
      document.getElementById("btn-lobby").style.display = "block";
    }
  }
}

function startGame() {
  gameState.status = "question_active";
  renderUI();
  db.ref("salas/room_1").set(gameState);
}

// NUEVAS FUNCIONES DE CONTROL
function stopTimer() {
  gameState.status = "time_up";
  renderUI();
  db.ref("salas/room_1").set(gameState);
}

function returnToLobby() {
  gameState.status = "waiting_players";
  renderUI();
  db.ref("salas/room_1").set(gameState);
}

db.ref("salas/room_1").set(gameState);
renderUI();