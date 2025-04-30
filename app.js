const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const levelButtonsContainer = document.getElementById('level-buttons');

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let currentLevel = 1;
let running = true;

const winConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

init();

function init() {
  createLevelButtons();
  updateLevelUI();
  cells.forEach(cell => cell.addEventListener('click', cellClicked));
  restartBtn.addEventListener('click', () => {
    currentLevel = 1;
    updateLevelUI();
    startGame();
  });
  startGame();
}

function createLevelButtons() {
  for (let i = 1; i <= 15; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.addEventListener('click', () => {
      currentLevel = i;
      updateLevelUI();
      startGame();
    });
    levelButtonsContainer.appendChild(btn);
  }
}

function updateLevelUI() {
  document.querySelectorAll('#level-buttons button').forEach((btn, index) => {
    btn.classList.toggle('active', index + 1 === currentLevel);
  });
}

function startGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  running = true;
  statusText.textContent = `Līmenis ${currentLevel} – Tavs gājiens (X)`;
  cells.forEach(cell => cell.textContent = "");
}

function cellClicked() {
  const index = this.getAttribute('data-index');
  if (board[index] !== "" || !running) return;

  updateCell(this, index, currentPlayer);
  if (checkWinner()) return;

  currentPlayer = "O";
  statusText.textContent = "AI domā...";
  setTimeout(aiMove, 300);
}

function updateCell(cell, index, player) {
  board[index] = player;
  cell.textContent = player;
}

function aiMove() {
  if (!running) return;

  let move;
  if (currentLevel <= 5) {
    move = getRandomMove();
  } else if (currentLevel <= 10) {
    move = getBestAvailableMove();
  } else {
    move = getMiniMaxMove(board, "O").index;
  }

  updateCell(cells[move], move, currentPlayer);
  if (checkWinner()) return;

  currentPlayer = "X";
  statusText.textContent = `Līmenis ${currentLevel} – Tavs gājiens (X)`;
}

function getRandomMove() {
  const empty = board.map((val, idx) => val === "" ? idx : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getBestAvailableMove() {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = "O";
      if (isWin("O")) {
        board[i] = "";
        return i;
      }
      board[i] = "";
    }
  }
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = "X";
      if (isWin("X")) {
        board[i] = "";
        return i;
      }
      board[i] = "";
    }
  }
  return getRandomMove();
}

function getMiniMaxMove(newBoard, player) {
  const availSpots = newBoard.map((val, idx) => val === "" ? idx : null).filter(v => v !== null);

  if (isWin("X", newBoard)) return { score: -10 };
  if (isWin("O", newBoard)) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    const result = getMiniMaxMove(newBoard, player === "O" ? "X" : "O");
    move.score = result.score;

    newBoard[availSpots[i]] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

function isWin(player, b = board) {
  return winConditions.some(condition =>
    condition.every(index => b[index] === player)
  );
}

function checkWinner() {
  if (isWin(currentPlayer)) {
    statusText.textContent = `${currentPlayer} uzvarēja!`;
    running = false;

    if (currentPlayer === "X") {
      setTimeout(() => {
        if (currentLevel < 15) {
          currentLevel++;
          updateLevelUI();
          startGame();
        } else {
          statusText.textContent = "Tu uzvarēji VISOS līmeņos! 🏆";
        }
      }, 1000);
    }

    return true;
  }

  if (!board.includes("")) {
    statusText.textContent = "Neizšķirts!";
    running = false;
    return true;
  }

  return false;
}
