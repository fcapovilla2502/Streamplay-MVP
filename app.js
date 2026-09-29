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

function startGame() {
  gameState.status = "question_active";
  renderUI();
}

// Iniciar renderizado al cargar
renderUI();