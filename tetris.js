// 게임 설정 상수
const GAME_CONFIG = {
  ROWS: 20,
  COLS: 10,
  BLOCK_SIZE: 30,
  INITIAL_SPEED: 500,
  COLORS: [null, "cyan", "grey", "orange", "yellow", "green", "purple", "red"],
}

// 테트리스 블록 정의
const TETRIS_PIECES = [
  { shape: [[1, 1, 1, 1]], color: 1 }, // I
  {
    shape: [
      [2, 2, 2],
      [0, 2, 0],
    ],
    color: 2,
  }, // T
  {
    shape: [
      [3, 3, 0],
      [0, 3, 3],
    ],
    color: 3,
  }, // Z
  {
    shape: [
      [0, 4, 4],
      [4, 4, 0],
    ],
    color: 4,
  }, // S
  {
    shape: [
      [5, 5],
      [5, 5],
    ],
    color: 5,
  }, // O
  {
    shape: [
      [6, 6, 6],
      [6, 0, 0],
    ],
    color: 6,
  }, // J
  {
    shape: [
      [7, 7, 7],
      [0, 0, 7],
    ],
    color: 7,
  }, // L
]

class TetrisGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId)
    this.context = this.canvas.getContext("2d")
    this.init()
  }

  init() {
    this.board = this.createEmptyBoard()
    this.currentPiece = null
    this.currentPosition = { x: 0, y: 0 }
    this.gameInterval = null
    this.gameSpeed = GAME_CONFIG.INITIAL_SPEED
    this.isGameRunning = false
    this.level = 1
    this.totalLines = 0
  }

  createEmptyBoard = () => Array.from({ length: GAME_CONFIG.ROWS }, () => Array(GAME_CONFIG.COLS).fill(0))

  startGame() {
    this.init()
    this.clearCanvas()
    this.spawnNewPiece()
    this.startGameLoop()
    this.isGameRunning = true
  }

  startGameLoop() {
    if (this.gameInterval) clearInterval(this.gameInterval)
    this.gameInterval = setInterval(() => this.moveDown(), this.gameSpeed)
  }

  pause = () => (this.isGameRunning = !this.isGameRunning)

  spawnNewPiece() {
    const randomIndex = Math.floor(Math.random() * TETRIS_PIECES.length)
    const pieceTemplate = TETRIS_PIECES[randomIndex]

    this.currentPiece = {
      shape: this.deepCopyArray(pieceTemplate.shape),
      color: pieceTemplate.color,
    }

    this.currentPosition = {
      x: Math.floor(GAME_CONFIG.COLS / 2) - Math.floor(this.currentPiece.shape[0].length / 2),
      y: 0,
    }

    if (!this.isValidPosition(this.currentPosition.x, this.currentPosition.y)) {
      this.gameOver()
      return
    }

    this.drawPiece()
  }

  deepCopyArray = (arr) => arr.map((row) => [...row])

  isValidPosition(x, y, piece = this.currentPiece) {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const boardX = x + col
          const boardY = y + row

          if (boardX < 0 || boardX >= GAME_CONFIG.COLS || boardY < 0 || boardY >= GAME_CONFIG.ROWS || this.board[boardY][boardX]) return false
        }
      }
    }
    return true
  }

  clearPiece() {
    const { shape } = this.currentPiece
    const { x, y } = this.currentPosition

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          this.context.clearRect((x + col) * GAME_CONFIG.BLOCK_SIZE, (y + row) * GAME_CONFIG.BLOCK_SIZE, GAME_CONFIG.BLOCK_SIZE, GAME_CONFIG.BLOCK_SIZE)
        }
      }
    }
  }

  drawPiece(x = this.currentPosition.x, y = this.currentPosition.y, piece = this.currentPiece) {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          this.context.fillStyle = GAME_CONFIG.COLORS[piece.color]
          this.context.fillRect((x + col) * GAME_CONFIG.BLOCK_SIZE, (y + row) * GAME_CONFIG.BLOCK_SIZE, GAME_CONFIG.BLOCK_SIZE, GAME_CONFIG.BLOCK_SIZE)
        }
      }
    }
  }

  drawBoard() {
    for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
      for (let col = 0; col < GAME_CONFIG.COLS; col++) {
        if (this.board[row][col]) {
          this.context.fillStyle = GAME_CONFIG.COLORS[this.board[row][col]]
          this.context.fillRect(col * GAME_CONFIG.BLOCK_SIZE, row * GAME_CONFIG.BLOCK_SIZE, GAME_CONFIG.BLOCK_SIZE, GAME_CONFIG.BLOCK_SIZE)
        }
      }
    }
  }

  clearCanvas = () => this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

  moveLeft() {
    if (!this.isGameRunning) return
    this.movePiece(-1, 0)
  }

  moveRight() {
    if (!this.isGameRunning) return
    this.movePiece(1, 0)
  }

  moveDown() {
    if (!this.isGameRunning) return

    const newY = this.currentPosition.y + 1
    if (this.isValidPosition(this.currentPosition.x, newY)) {
      this.clearPiece()
      this.currentPosition.y = newY
      this.drawPiece()
    } else {
      this.lockPiece()
      this.clearCompleteLines()
      this.spawnNewPiece()
    }
  }

  movePiece(deltaX, deltaY) {
    const newX = this.currentPosition.x + deltaX
    const newY = this.currentPosition.y + deltaY

    if (this.isValidPosition(newX, newY)) {
      this.clearPiece()
      this.currentPosition.x = newX
      this.currentPosition.y = newY
      this.drawPiece()
    }
  }

  rotatePiece() {
    if (!this.isGameRunning) return

    this.clearPiece()
    const originalShape = this.deepCopyArray(this.currentPiece.shape)
    const rotatedShape = this.rotateMatrix(this.currentPiece.shape)

    this.currentPiece.shape = rotatedShape

    if (!this.isValidPosition(this.currentPosition.x, this.currentPosition.y)) {
      // 회전이 불가능하면 원래 상태로 복원
      this.currentPiece.shape = originalShape
    }

    this.drawPiece()
  }

  rotateMatrix(matrix) {
    const rows = matrix.length
    const cols = matrix[0].length
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0))

    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) rotated[col][rows - 1 - row] = matrix[row][col]

    return rotated
  }

  dropPiece() {
    if (!this.isGameRunning) return

    this.clearPiece()
    while (this.isValidPosition(this.currentPosition.x, this.currentPosition.y + 1)) this.currentPosition.y++

    this.drawPiece()

    // 즉시 고정
    this.lockPiece()
    this.clearCompleteLines()
    this.spawnNewPiece()
  }

  lockPiece() {
    const { shape, color } = this.currentPiece
    const { x, y } = this.currentPosition

    for (let row = 0; row < shape.length; row++) for (let col = 0; col < shape[row].length; col++) if (shape[row][col]) this.board[y + row][x + col] = color
  }

  clearCompleteLines() {
    const linesToClear = []

    for (let row = 0; row < GAME_CONFIG.ROWS; row++) if (this.board[row].every((cell) => cell !== 0)) linesToClear.push(row)

    // 완성된 라인 제거 (역순으로 제거해야 인덱스 문제 없음)
    for (let i = linesToClear.length - 1; i >= 0; i--) this.board.splice(linesToClear[i], 1)
    for (let i = linesToClear.length - 1; i >= 0; i--) this.board.unshift(Array(GAME_CONFIG.COLS).fill(0))

    if (linesToClear.length > 0) {
      this.updateScore(linesToClear.length)
      this.updateLevel()

      this.clearCanvas()
      this.drawBoard()
    }
  }

  updateScore = (linesCleared) => (this.totalLines += linesCleared)

  updateLevel() {
    // 10줄마다 레벨 업
    const newLevel = Math.floor(this.totalLines / 10) + 1

    if (newLevel > this.level) {
      this.level = newLevel
      this.updateGameSpeed()
    }
  }

  updateGameSpeed() {
    // 레벨이 올라갈수록 속도 증가 (최소 50ms까지)
    const speedDecrease = (this.level - 1) * 50
    this.gameSpeed = Math.max(50, GAME_CONFIG.INITIAL_SPEED - speedDecrease)

    // 게임 루프 다시 시작 (새로운 속도로)
    this.startGameLoop()
  }

  gameOver() {
    this.isGameRunning = false
    if (this.gameInterval) clearInterval(this.gameInterval)

    alert("GAME OVER")
    this.startGame()
  }
}

function setupEventListeners(game) {
  // 키보드 이벤트
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":
        game.moveLeft()
        break
      case "ArrowRight":
        game.moveRight()
        break
      case "ArrowDown":
        game.moveDown()
        break
      case "ArrowUp":
        game.rotatePiece()
        break
      case " ":
        e.preventDefault()
        game.dropPiece()
        break
    }
  })

  // 버튼 이벤트 (HTML 버튼이 있다면)
  const pauseBtn = document.getElementById("pause")
  const leftBtn = document.getElementById("left")
  const rightBtn = document.getElementById("right")
  const downBtn = document.getElementById("down")
  const rotateBtn = document.getElementById("rotate")
  const dropBtn = document.getElementById("drop")

  if (pauseBtn) pauseBtn.addEventListener("click", () => game.pause())
  if (leftBtn) leftBtn.addEventListener("click", () => game.moveLeft())
  if (rightBtn) rightBtn.addEventListener("click", () => game.moveRight())
  if (downBtn) downBtn.addEventListener("click", () => game.moveDown())
  if (rotateBtn) rotateBtn.addEventListener("click", () => game.rotatePiece())
  if (dropBtn) dropBtn.addEventListener("click", () => game.dropPiece())
}

// 게임 초기화 및 시작
const tetrisGame = new TetrisGame("tetris")
setupEventListeners(tetrisGame)
tetrisGame.startGame()
