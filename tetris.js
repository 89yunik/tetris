const canvas = document.getElementById("tetris")
const context = canvas.getContext("2d")

// 테트리스 블록의 모양
const pieces = [
  [[1, 1, 1, 1]], // I
  [
    [2, 2, 2],
    [0, 2, 0],
  ], // T
  [
    [3, 3, 0],
    [0, 3, 3],
  ], // S
  [
    [0, 4, 4],
    [4, 4, 0],
  ], // Z
  [
    [5, 5],
    [5, 5],
  ], // O
  [
    [6, 6, 6],
    [6, 0, 0],
  ], // L
  [
    [7, 7, 7],
    [0, 0, 7],
  ], // J
]
const pieceColors = [null, "cyan", "grey", "orange", "yellow", "green", "purple", "red"]

const [ROWS, COLS, BLOCK_SIZE] = [20, 10, 30]
let [currentPiece, currentX, currentY, updateTime, board, gameInterval] = [null, 0, 0, 500]

function startGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  clearBoard()
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
    clearFullRows()
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
  for (let y = 0; y < pieceHeight; y++)
    for (let x = 0; x < pieceWidth; x++)
      if (currentPiece.shape[y][x]) {
        context.clearRect((currentX + x) * BLOCK_SIZE, (currentY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
      }
}

function clearBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height)
}

function drawCurrentPiece() {
  drawBoard((startX = currentX), (startY = currentY), (subBoard = currentPiece.shape))
}

function drawBoard(startX, startY, subBoard) {
  for (let y = 0; y < subBoard.length; y++) {
    for (let x = 0; x < subBoard[0].length; x++) {
      if (subBoard[y][x]) {
        context.fillStyle = pieceColors[subBoard[y][x]]
        context.fillRect((x + startX) * BLOCK_SIZE, (y + startY) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
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

function clearFullRows() {
  const rowsToClear = []
  for (let y = 0; y < ROWS; y++) if (board[y].every((cell) => cell)) rowsToClear.push(y)
  for (let row of rowsToClear) {
    board.splice(row, 1)
    board.unshift(Array(COLS).fill(0))
  }

  clearBoard()
  drawBoard((startX = 0), (startY = 0), (subBoard = board))
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      moveLeftCurrentPiece()
      break
    case "ArrowRight":
      moveRightCurrentPiece()
      break
    case "ArrowDown":
      moveDownCurrentPiece()
      break
    case "ArrowUp":
      rotateCurrentPiece()
      break
    case " ":
      dropCurrentPiece()
      break
  }
})

function moveLeftCurrentPiece() {
  updateCurrentPiece((offsetX = -1), (offsetY = 0), (merge = false))
}

function moveRightCurrentPiece() {
  updateCurrentPiece((offsetX = 1), (offsetY = 0), (merge = false))
}

function moveDownCurrentPiece() {
  updateCurrentPiece((offsetX = 0), (offsetY = 1))
}

function dropCurrentPiece() {
  while (canDrawPiece((nextX = currentX), (nextY = currentY + 1))) updateCurrentPiece((offsetX = 0), (offsetY = 1))
}

function rotateCurrentPiece() {
  clearCurrentPiece()
  const rotatedShape = currentPiece.shape[0].map((_, i) => currentPiece.shape.map((row) => row[i]).reverse())
  currentPiece.shape = rotatedShape

  if (!canDrawPiece((nextX = currentX), (nextY = currentY))) {
    currentPiece.shape = rotatedShape[0].map((_, i) => rotatedShape.map((row) => row[i])).reverse()
  }

  drawCurrentPiece()
}

document.getElementById("left").addEventListener("click", moveLeftCurrentPiece)
document.getElementById("right").addEventListener("click", moveRightCurrentPiece)
document.getElementById("down").addEventListener("click", moveDownCurrentPiece)
document.getElementById("rotate").addEventListener("click", rotateCurrentPiece)
document.getElementById("drop").addEventListener("click", dropCurrentPiece)

startGame()
