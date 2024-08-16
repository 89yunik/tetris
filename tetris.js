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
  gameInterval = setInterval(updateCurrentPiece, updateTime, (offsetX = 0), (offsetY = 1))

  drawCurrentPiece()
}

function spawnPiece() {
  const index = Math.floor(Math.random() * pieces.length)
  currentPiece = { shape: pieces[index], color: index + 1 }
  currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2)
  currentY = 0

  if (!canDrawPiece(currentX, currentY)) {
    alert("GAME OVER")
    startGame()
  }
}

function updateCurrentPiece(offsetX = 0, offsetY = 0, merge = true) {
  const nextX = currentX + offsetX
  const nextY = currentY + offsetY
  if (canDrawPiece(nextX, nextY)) {
    clearCurrentPiece()
    moveCurrentPiece(nextX, nextY)
  } else if (merge) {
    mergeCurrentPiece()
    spawnPiece()
  }
  drawCurrentPiece()
}

function canDrawPiece(nextX, nextY) {
  for (let y = 0; y < currentPiece.shape.length; y++)
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      blockY = nextY + y
      blockX = nextX + x
      if (currentPiece.shape[y][x] && (blockX < 0 || blockX >= COLS || blockY < 0 || blockY >= ROWS || board[blockY][blockX])) return false
    }
  return true
}

function clearCurrentPiece() {
  pieceWidth = currentPiece.shape[0].length
  pieceHeight = currentPiece.shape.length
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

function moveCurrentPiece(nextX, nextY) {
  currentX = nextX
  currentY = nextY
}

function mergeCurrentPiece() {
  for (let y = 0; y < currentPiece.shape.length; y++)
    for (let x = 0; x < currentPiece.shape[0].length; x++)
      if (currentPiece.shape[y][x]) {
        board[currentY + y][currentX + x] = currentPiece.color
      }
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      updateCurrentPiece((offsetX = -1), (offsetY = 0), (merge = false))
      break
    case "ArrowRight":
      updateCurrentPiece((offsetX = 1), (offsetY = 0), (merge = false))
      break
    case "ArrowDown":
      updateCurrentPiece((offsetX = 0), (offsetY = 1))
      break
    case "ArrowUp":
      rotateCurrentPiece()
      break
  }
})

function rotateCurrentPiece() {
  clearCurrentPiece()
  const rotatedShape = currentPiece.shape[0].map((_, i) => currentPiece.shape.map((row) => row[i]).reverse())
  currentPiece.shape = rotatedShape

  if (!canDrawPiece((nextX = currentX), (nextY = currentY))) {
    currentPiece.shape = rotatedShape[0].map((_, i) => rotatedShape.map((row) => row[i])).reverse()
  }

  drawCurrentPiece()
}

startGame()
