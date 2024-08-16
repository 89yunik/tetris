const canvas = document.getElementById("tetris")
const context = canvas.getContext("2d")

// 테트리스 블록의 모양
const pieces = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1, 1],
    [0, 1, 0],
  ], // T
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // S
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // Z
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [1, 1, 1],
    [1, 0, 0],
  ], // L
  [
    [1, 1, 1],
    [0, 0, 1],
  ], // J
]
const pieceColors = [null, "cyan", "grey", "orange", "yellow", "green", "purple", "red"]

const [ROWS, COLS, BLOCK_SIZE] = [20, 10, 30]
let [currentPiece, currentX, currentY, updateTime, board, gameInterval] = [null, 0, 0, 500]

function startGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  context.clearRect(0, 0, canvas.width, canvas.height)
  spawnPiece()

  if (gameInterval) clearInterval(gameInterval)
  gameInterval = setInterval(updateCurrentPiece, updateTime)

  drawCurrentPiece()
}

function spawnPiece() {
  const index = Math.floor(Math.random() * pieces.length)
  currentPiece = { shape: pieces[index], color: index + 1 }
  currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2)
  currentY = 0
}

function updateCurrentPiece() {
  if (canMovePiece(currentX, currentY + 1)) {
    clearCurrentPiece((pieceWidth = currentPiece.shape[0].length), (pieceHeight = currentPiece.shape.length))
    moveDownCurrentPiece()
  } else {
    mergeCurrentPiece()
    spawnPiece()
  }
  drawCurrentPiece()
}

function canMovePiece(nextX, nextY) {
  for (let y = 0; y < currentPiece.shape.length; y++)
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      blockY = nextY + y
      blockX = nextX + x
      if (currentPiece.shape[y][x] && (blockX < 0 || blockX >= COLS || blockY < 0 || blockY >= ROWS || board[blockY][blockX])) return false
    }
  return true
}

function clearCurrentPiece(pieceWidth, pieceHeight) {
  context.clearRect(currentX * BLOCK_SIZE, currentY * BLOCK_SIZE, pieceWidth * BLOCK_SIZE, pieceHeight * BLOCK_SIZE)
}

function drawCurrentPiece() {
  context.fillStyle = pieceColors[currentPiece.color]
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        context.fillRect((currentX + x) * BLOCK_SIZE, (currentY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
      }
    }
  }
}

function moveDownCurrentPiece() {
  currentY++
}

function mergeCurrentPiece() {
  for (let y = 0; y < currentPiece.shape.length; y++)
    for (let x = 0; x < currentPiece.shape[0].length; x++)
      if (currentPiece.shape[y][x]) {
        board[currentY + y][currentX + x] = currentPiece.color
      }
}

startGame()
