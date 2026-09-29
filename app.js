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

// NUESTRO BANCO DE PREGUNTAS DINÁMICO
const questionBank = [
  {
    text: "¿Quién forjó el Anillo Único?",
    options: [
      { id: "A", text: "Elrond" },
      { id: "B", text: "Sauron" },
      { id: "C", text: "Celebrimbor" },
      { id: "D", text: "Isildur" }
    ],
    correct_answer_id: "B"
  },
  {
    text: "¿Cómo se llama la espada reconstruida de Aragorn?",
    options: [
      { id: "A", text: "Andúril" },
      { id: "B", text: "Narsil" },
      { id: "C", text: "Glamdring" },
      { id: "D", text: "Dardo" }
    ],
    correct_answer_id: "A"
  },
  {
    text: "¿En qué monte fue destruido el Anillo?",
    options: [
      { id: "A", text: "Monte Gundabad" },
      { id: "B", text: "Erebor" },
      { id: "C", text: "Monte del Destino" },
      { id: "D", text: "Caradhras" }
    ],
    correct_answer_id: "C"
  }
];

let currentQuestionIndex = 0; // Lleva la cuenta de la pregunta actual

let gameState = {
  status: "waiting_players",
  config: { title: "TRIVIA DEL GORDO" },
  current_state: {
    question_data: questionBank[0] // Carga la primera por defecto
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
    
    // Le agregamos un pequeño contador visual al título (Ej: Pregunta 1/3)
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

    // LÓGICA DE BOTONES DINÁMICA
    if (gameState.status === "question_active") {
      document.getElementById("btn-stop").style.display = "block";
      document.getElementById("btn-next").style.display = "none";
      document.getElementById("btn-lobby").style.display = "none";
    } else if (gameState.status === "time_up") {
      document.getElementById("btn-stop").style.display = "none";
      
      // Si todavía quedan preguntas, mostrar "Siguiente". Si no, mostrar "Volver al Lobby".
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

// INICIAR EL JUEGO DESDE CERO
function startGame() {
  currentQuestionIndex = 0; // Reinicia a la pregunta 1
  gameState.status = "question_active";
  gameState.current_state.question_data = questionBank[currentQuestionIndex];
  renderUI();
  db.ref("salas/room_1").set(gameState);
}

// PASAR A LA SIGUIENTE PREGUNTA
function nextQuestion() {
  currentQuestionIndex++; // Suma 1 al contador
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

db.ref("salas/room_1").set(gameState);
renderUI();