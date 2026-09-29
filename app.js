// ==========================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN
// ==========================================
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

// Variables Globales
let questionBank = [];
let currentQuestionIndex = 0;

let gameState = {
  status: "waiting_players",
  config: { title: "TRIVIA DEL GORDO" },
  current_state: {
    question_data: null 
  }
};

// ==========================================
// 2. CARGA DE DATOS (PREGUNTAS)
// ==========================================
fetch('preguntas.json?v=' + new Date().getTime())
  .then(response => response.json())
  .then(data => {
    questionBank = data;
    console.log("¡Preguntas cargadas con éxito! Total:", questionBank.length);
    
    gameState.current_state.question_data = questionBank[0];
    
    // ¡CORRECCIÓN!: Usamos .update() para no borrar a los jugadores al recargar el Dashboard
    db.ref("salas/room_1").update(gameState);
    renderUI();
  })
  .catch(error => console.error("Error al cargar el JSON:", error));

// ==========================================
// 3. ACTUALIZACIÓN VISUAL DEL DASHBOARD
// ==========================================
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

// ==========================================
// 4. CONTROLES DEL JUEGO (BOTONES)
// ==========================================
function startGame() {
  currentQuestionIndex = 0;
  gameState.status = "question_active";
  gameState.current_state.question_data = questionBank[currentQuestionIndex];
  renderUI();
  // ¡CORRECCIÓN!: .update() en vez de .set()
  db.ref("salas/room_1").update(gameState);
}

function nextQuestion() {
  currentQuestionIndex++;
  gameState.status = "question_active";
  gameState.current_state.question_data = questionBank[currentQuestionIndex];
  renderUI();
  // ¡CORRECCIÓN!: .update() en vez de .set()
  db.ref("salas/room_1").update(gameState);
}

function returnToLobby() {
  gameState.status = "waiting_players";
  renderUI();
  // ¡CORRECCIÓN!: .update() en vez de .set()
  db.ref("salas/room_1").update(gameState);
}

// ==========================================
// 5. MOTOR DE PUNTOS Y RANKING
// ==========================================
function stopTimer() {
  gameState.status = "time_up";
  renderUI();
  
  // ¡CORRECCIÓN!: .update() evita borrar las respuestas de los jugadores
  db.ref("salas/room_1").update(gameState);

  const correctId = gameState.current_state.question_data.correct_answer_id;
  
  // Evaluar respuestas y sumar puntos
  db.ref("salas/room_1/players").once("value", (snapshot) => {
    const players = snapshot.val();
    if (!players) return;

    let updates = {};
    for (let playerId in players) {
      let player = players[playerId];
      
      // Si respondió bien, suma 100
      if (player.current_answer === correctId) {
        updates[playerId + "/score"] = (player.score || 0) + 100;
      }
    }
    
    // Si hubo ganadores, enviamos los puntos a Firebase
    if (Object.keys(updates).length > 0) {
      db.ref("salas/room_1/players").update(updates);
    }
  });
}

// Escuchar y dibujar el Leaderboard en tiempo real
db.ref("salas/room_1/players").on("value", (snapshot) => {
  const players = snapshot.val();
  const listContainer = document.getElementById("leaderboard-list");
  const playersCountUI = document.getElementById("players-count");
  
  if (!players) {
    document.getElementById("ui-leaderboard").style.display = "none";
    if(playersCountUI) playersCountUI.innerText = "0";
    return;
  }

  // Actualizar el contador de jugadores en el Lobby
  const playersArray = Object.values(players);
  if(playersCountUI) playersCountUI.innerText = playersArray.length;

  // Ordenar de mayor a menor puntaje
  playersArray.sort((a, b) => b.score - a.score);
  
  listContainer.innerHTML = "";
  playersArray.forEach((p, index) => {
    let position = index + 1;
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
  
  document.getElementById("ui-leaderboard").style.display = "block";
});