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