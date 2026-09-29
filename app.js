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

let questionBank = [];
let currentQuestionIndex = 0;

let gameState = {
  status: "waiting_players",
  config: { title: "TRIVIA DEL GORDO" },
  current_state: {
    question_data: null // Se llenará cuando carguemos el JSON
  }
};

// 1. CARGAR PREGUNTAS DESDE EL ARCHIVO JSON
fetch('preguntas.json?v=' + new Date().getTime())
  .then(response => response.json())
  .then(data => {
    questionBank = data;
    console.log("¡Preguntas cargadas con éxito! Total:", questionBank.length);
    
    // Dejamos lista la primera pregunta en memoria
    gameState.current_state.question_data = questionBank[0];
    
    // Inicializamos la base de datos y la pantalla
    db.ref("salas/room_1").set(gameState);
    renderUI();
  })
  .catch(error => console.error("Error al cargar el JSON:", error));


// 2. RENDERIZADO VISUAL DEL DASHBOARD
function renderUI() {
  document.getElementById("screen-waiting").style.display = "none";
  document.getElementById("screen-question").style.display = "none";

  if (gameState.status === "waiting_players") {
    document.getElementById("screen-waiting").style.display = "block";
    document.getElementById("ui-title").innerText = gameState.config.title;
  } 
  else if (gameState.status === "question_active" || gameState.status === "time_up") {
    document.getElementById("screen-question").style.display = "block";
    
    document.getElementById("ui-question-text").innerText = `(${currentQuestionIndex + 1}/${questionBank.length}) ` + gameState.current_state.question_data.text;
    
    const optionsContainer = document.getElementById("ui-options");
    optionsContainer.innerHTML = "";
    
    gameState.current_state.question_data.options.forEach(opt => {
      let extraStyle = "";
      if (gameState.status === "time_up" && opt.id === gameState.current_state.question_data.correct_answer_id) {
        extraStyle = "background: rgba(0, 255, 0, 0.15); border-color: #00FF00;";
      }
      optionsContainer.innerHTML += `<button class="btn-option" style="${extraStyle}"><b>${opt.id}</b> — ${opt.text}</button>`;
    });

    if (gameState.status === "question_active") {
      document.getElementById("btn-stop").style.display = "block";
      document.getElementById("btn-next").style.display = "none";
      document.getElementById("btn-lobby").style.display = "none";
    } else if (gameState.status === "time_up") {
      document.getElementById("btn-stop").style.display = "none";
      
      if (currentQuestionIndex < questionBank.length - 1) {
        document.getElementById("btn-next").style.display = "block";
        document.getElementById("btn-lobby").style.display = "none";
      } else {
        document.getElementById("btn-next").style.display = "none";
        document.getElementById("btn-lobby").style.display = "block";
      }
    }
  }
}

// 3. CONTROLES DEL JUEGO
function startGame() {
  currentQuestionIndex = 0;
  gameState.status = "question_active";
  gameState.current_state.question_data = questionBank[currentQuestionIndex];
  renderUI();
  db.ref("salas/room_1").set(gameState);
}

function nextQuestion() {
  currentQuestionIndex++;
  gameState.status = "question_active";
  gameState.current_state.question_data = questionBank[currentQuestionIndex];
  renderUI();
  db.ref("salas/room_1").set(gameState);
}

// FINALIZAR TIEMPO Y CALCULAR PUNTOS
function stopTimer() {
  gameState.status = "time_up";
  renderUI();
  db.ref("salas/room_1").set(gameState);

  // ¡LA MAGIA DE LOS PUNTOS!
  const correctId = gameState.current_state.question_data.correct_answer_id;
  
  // Vamos a buscar qué respondieron los jugadores
  db.ref("salas/room_1/players").once("value", (snapshot) => {
    const players = snapshot.val();
    if (!players) return;

    let updates = {};
    for (let playerId in players) {
      let player = players[playerId];
      
      // Si el jugador respondió correctamente, le sumamos 100 puntos
      if (player.current_answer === correctId) {
        updates[playerId + "/score"] = (player.score || 0) + 100;
      }
    }
    
    // Si alguien sumó puntos, mandamos la actualización masiva a Firebase
    if (Object.keys(updates).length > 0) {
      db.ref("salas/room_1/players").update(updates);
    }
  });
}
// ESCUCHAR Y DIBUJAR EL RANKING EN TIEMPO REAL
db.ref("salas/room_1/players").on("value", (snapshot) => {
  const players = snapshot.val();
  const listContainer = document.getElementById("leaderboard-list");
  
  if (!players) {
    document.getElementById("ui-leaderboard").style.display = "none";
    return;
  }

  // Convertimos los jugadores a un Array y los ordenamos de mayor a menor puntaje
  const playersArray = Object.values(players).sort((a, b) => b.score - a.score);
  
  listContainer.innerHTML = "";
  playersArray.forEach((p, index) => {
    let position = index + 1;
    // Asignamos medallas al Top 3
    let medal = position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : position + ".";
    
    listContainer.innerHTML += `
      <li style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 1.2rem;">
        <span style="font-weight: bold; color: ${position <= 3 ? 'var(--secondary)' : '#fff'};">
          ${medal} ${p.name.toUpperCase()}
        </span>
        <span style="color: var(--primary); font-weight: bold; text-shadow: 0 0 10px rgba(255,0,255,0.5);">
          ${p.score} PTS
        </span>
      </li>
    `;
  });
  
  // Mostrar el panel de ranking si ya hay jugadores
  document.getElementById("ui-leaderboard").style.display = "block";
});

function returnToLobby() {
  gameState.status = "waiting_players";
  renderUI();
  db.ref("salas/room_1").set(gameState);
}