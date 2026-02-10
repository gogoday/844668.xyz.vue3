<template>
  <div class="sudoku-container">
    <h1>数独游戏</h1>
    <div class="game-controls">
      <button @click="generateNewGame" :disabled="isGenerating">新游戏</button>
      <button @click="checkSolution">检查答案</button>
      <button @click="solvePuzzle">显示答案</button>
      <div class="difficulty-selector">
        <label>难度：</label>
        <select v-model="selectedDifficulty" :disabled="isGenerating">
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
    </div>
    
    <div class="sudoku-board" :class="{ 'solved': gameStatus === 'solved' }">
      <div 
        v-for="(row, rowIndex) in board" 
        :key="rowIndex" 
        class="sudoku-row"
      >
        <div 
          v-for="(cell, colIndex) in row" 
          :key="colIndex"
          class="sudoku-cell"
          :class="{
            'editable': !initialBoard[rowIndex]?.[colIndex],
            'fixed': initialBoard[rowIndex]?.[colIndex],
            'highlight': isHighlighted(rowIndex, colIndex),
            'error': errors.has(`${rowIndex}-${colIndex}`),
            'top-border': rowIndex % 3 === 0 && rowIndex !== 0,
            'left-border': colIndex % 3 === 0 && colIndex !== 0
          }"
          @click="selectCell(rowIndex, colIndex)"
        >
          <input
            v-if="!initialBoard[rowIndex]?.[colIndex]"
            :value="board[rowIndex]![colIndex]"
            @input="handleInput($event, rowIndex, colIndex)"
            @keydown="handleKeyDown($event, rowIndex, colIndex)"
            :class="{ 'selected': selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex }"
            :readonly="gameStatus === 'solved'"
          />
          <span v-else>{{ initialBoard[rowIndex]?.[colIndex] }}</span>
        </div>
      </div>
    </div>
    
    <div class="number-pad" v-if="selectedCell">
      <button 
        v-for="num in 9" 
        :key="num"
        @click="fillNumber(num)"
        class="number-btn"
      >
        {{ num }}
      </button>
      <button @click="fillNumber(null)" class="clear-btn">清除</button>
    </div>
    
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
    
    <div v-if="timer" class="timer">
      时间: {{ formatTime(timer) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 游戏状态
const board = ref<number[][]>(Array(9).fill(null).map(() => Array(9).fill(0)))
const initialBoard = ref<number[][]>(Array(9).fill(0).map(() => Array(9).fill(0)))
const solution = ref<number[][]>(Array(9).fill(0).map(() => Array(9).fill(0)))
const selectedCell = ref<{row: number, col: number} | null>(null)
const errors = ref<Set<string>>(new Set())
const gameStatus = ref<'playing' | 'solved'>('playing')
const timer = ref<number>(0)
const message = ref<string>('')
const messageType = ref<'success' | 'error'>('success')
const isGenerating = ref<boolean>(false)
const selectedDifficulty = ref<'easy' | 'medium' | 'hard'>('medium')

// 初始化游戏
onMounted(() => {
  generateNewGame()
  startTimer()
})

// 生成预设的数独谜题（避免动态生成的性能问题）
function getPresetPuzzle(difficulty: 'easy' | 'medium' | 'hard') {
  // 这里我们使用一个示例谜题，实际应用中可以从谜题库中随机选择
  // 这是一个中等难度的数独谜题
  let puzzle: number[][]
  
  // 根据难度返回不同难度的谜题
  switch(difficulty) {
    case 'easy':
      // 简单难度 - 更多数字已给出
      puzzle = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ]
      break
    case 'medium':
      // 中等难度
      puzzle = [
        [0, 0, 0, 2, 6, 0, 7, 0, 1],
        [6, 8, 0, 0, 7, 0, 0, 9, 0],
        [1, 9, 0, 0, 0, 4, 5, 0, 0],
        [8, 2, 0, 1, 0, 0, 0, 4, 0],
        [0, 0, 4, 6, 0, 2, 9, 0, 0],
        [0, 5, 0, 0, 0, 3, 0, 2, 8],
        [0, 0, 9, 3, 0, 0, 0, 7, 4],
        [0, 4, 0, 0, 5, 0, 0, 3, 6],
        [7, 0, 3, 0, 1, 8, 0, 0, 0]
      ]
      break
    case 'hard':
      // 困难难度 - 较少数字已给出
      puzzle = [
        [0, 0, 0, 6, 0, 0, 4, 0, 0],
        [7, 0, 0, 0, 0, 3, 6, 0, 0],
        [0, 0, 0, 0, 9, 1, 0, 8, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 5, 0, 1, 8, 0, 0, 0, 3],
        [0, 0, 0, 3, 0, 6, 0, 4, 5],
        [0, 4, 0, 2, 0, 0, 0, 6, 0],
        [9, 0, 3, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 1, 0, 0]
      ]
      break
    default:
      puzzle = [
        [0, 0, 0, 2, 6, 0, 7, 0, 1],
        [6, 8, 0, 0, 7, 0, 0, 9, 0],
        [1, 9, 0, 0, 0, 4, 5, 0, 0],
        [8, 2, 0, 1, 0, 0, 0, 4, 0],
        [0, 0, 4, 6, 0, 2, 9, 0, 0],
        [0, 5, 0, 0, 0, 3, 0, 2, 8],
        [0, 0, 9, 3, 0, 0, 0, 7, 4],
        [0, 4, 0, 0, 5, 0, 0, 3, 6],
        [7, 0, 3, 0, 1, 8, 0, 0, 0]
      ]
  }
  
  return puzzle
}

// 预设的解决方案（与上面的谜题对应）
function getPresetSolution() {
  return [
    [4, 3, 5, 2, 6, 9, 7, 8, 1],
    [6, 8, 2, 5, 7, 1, 4, 9, 3],
    [1, 9, 7, 8, 3, 4, 5, 6, 2],
    [8, 2, 6, 1, 9, 5, 3, 4, 7],
    [3, 7, 4, 6, 8, 2, 9, 1, 5],
    [9, 5, 1, 7, 4, 3, 6, 2, 8],
    [5, 1, 9, 3, 2, 6, 8, 7, 4],
    [2, 4, 8, 9, 5, 7, 1, 3, 6],
    [7, 6, 3, 4, 1, 8, 2, 5, 9]
  ]
}

// 生成新游戏
async function generateNewGame() {
  isGenerating.value = true
  message.value = ''
  
  // 使用预设的谜题而不是动态生成
  const puzzle = getPresetPuzzle(selectedDifficulty.value)
  const completeSolution = getPresetSolution()
  
  // 更新状态
  board.value = JSON.parse(JSON.stringify(puzzle))
  initialBoard.value = JSON.parse(JSON.stringify(puzzle))
  solution.value = JSON.parse(JSON.stringify(completeSolution))
  selectedCell.value = null
  errors.value.clear()
  gameStatus.value = 'playing'
  timer.value = 0
  
  setTimeout(() => {
    isGenerating.value = false
  }, 300)
}

// 开始计时器
function startTimer() {
  setInterval(() => {
    if (gameStatus.value === 'playing') {
      timer.value++
    }
  }, 1000)
}

// 格式化时间
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 处理输入
function handleInput(event: Event, row: number, col: number) {
  const target = event.target as HTMLInputElement
  let value = target.value === '' ? 0 : parseInt(target.value)
  
  if (isNaN(value) || value < 0 || value > 9) {
    value = 0
  }
  
  board.value[row]![col] = value
  validateCell(row, col)
  checkWinCondition()
}

// 处理键盘事件
function handleKeyDown(event: KeyboardEvent, row: number, col: number) {
  if (event.key >= '1' && event.key <= '9') {
    board.value[row]![col] = parseInt(event.key)
    validateCell(row, col)
    checkWinCondition()
    event.preventDefault()
  } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
    board.value[row]![col] = 0
    validateCell(row, col)
    event.preventDefault()
  }
}

// 验证单个单元格
function validateCell(row: number, col: number) {
  // 清除当前单元格的错误状态
  errors.value.delete(`${row}-${col}`)
  
  // 如果单元格为空，则无需验证
  if (!board.value[row] || board.value[row][col] === 0) {
    return
  }
  
  // 检查行
  for (let c = 0; c < 9; c++) {
    if (c !== col && board.value[row]?.[c] === board.value[row]?.[col]) {
      errors.value.add(`${row}-${col}`)
      return
    }
  }
  
  // 检查列
  for (let r = 0; r < 9; r++) {
    if (r !== row && board.value[r]?.[col] === board.value[row]?.[col]) {
      errors.value.add(`${row}-${col}`)
      return
    }
  }
  
  // 检查3x3格子
  const startRow = Math.floor(row / 3) * 3
  const startCol = Math.floor(col / 3) * 3
  
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if ((r !== row || c !== col) && board.value[r]?.[c] === board.value[row]?.[col]) {
        errors.value.add(`${row}-${col}`)
        return
      }
    }
  }
}

// 验证整个棋盘
function validateBoard() {
  errors.value.clear()
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board.value[row]?.[col] !== 0) {
        // 检查行
        for (let c = 0; c < 9; c++) {
          if (c !== col && board.value[row]?.[c] === board.value[row]?.[col]) {
            errors.value.add(`${row}-${col}`)
          }
        }
        
        // 检查列
        for (let r = 0; r < 9; r++) {
          if (r !== row && board.value[r]?.[col] === board.value[row]?.[col]) {
            errors.value.add(`${row}-${col}`)
          }
        }
        
        // 检查3x3格子
        const startRow = Math.floor(row / 3) * 3
        const startCol = Math.floor(col / 3) * 3
        
        for (let r = startRow; r < startRow + 3; r++) {
          for (let c = startCol; c < startCol + 3; c++) {
            if ((r !== row || c !== col) && board.value[r]?.[c] === board.value[row]?.[col]) {
              errors.value.add(`${row}-${col}`)
            }
          }
        }
      }
    }
  }
}

// 选择单元格
function selectCell(row: number, col: number) {
  if (!initialBoard.value[row]?.[col]) {
    selectedCell.value = { row, col }
  }
}

// 填入数字
function fillNumber(num: number | null) {
  if (selectedCell.value) {
    const { row, col } = selectedCell.value
    if (!initialBoard.value[row]?.[col]) {
      board.value[row]![col] = num || 0
      validateCell(row, col)
      checkWinCondition()
    }
  }
}

// 检查胜利条件
function checkWinCondition() {
  // 检查是否有空格
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board.value[row]?.[col] === 0) {
        return // 还有空格，游戏未完成
      }
    }
  }
  
  // 验证整个棋盘
  validateBoard()
  
  // 如果没有错误，游戏完成
  if (errors.value.size === 0) {
    gameStatus.value = 'solved'
    message.value = `恭喜！你完成了数独，用时 ${formatTime(timer.value)}！`
    messageType.value = 'success'
  }
}

// 检查答案
function checkSolution() {
  validateBoard()
  
  if (errors.value.size === 0) {
    // 检查是否所有格子都已填写
    let isComplete = true
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board.value[row]?.[col] === 0) {
          isComplete = false
          break
        }
      }
      if (!isComplete) break
    }
    
    if (isComplete) {
      message.value = '所有数字都正确！'
      messageType.value = 'success'
    } else {
      message.value = '目前没有错误，但还有空格未填写。'
      messageType.value = 'success'
    }
  } else {
    message.value = `发现 ${errors.value.size} 个错误，请检查标红的位置。`
    messageType.value = 'error'
  }
}

// 显示答案
function solvePuzzle() {
  board.value = JSON.parse(JSON.stringify(solution.value))
  gameStatus.value = 'solved'
  message.value = '显示完整答案。'
  messageType.value = 'success'
}

// 判断是否高亮显示（同一行、同一列或同一宫的单元格）
function isHighlighted(row: number, col: number) {
  if (!selectedCell.value) return false
  const { row: selectedRow, col: selectedCol } = selectedCell.value
  return selectedRow === row || selectedCol === col || 
         (Math.floor(selectedRow / 3) === Math.floor(row / 3) && Math.floor(selectedCol / 3) === Math.floor(col / 3))
}

</script>

<style scoped>
.sudoku-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.game-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.game-controls button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
  font-size: 14px;
}

.game-controls button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.game-controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.difficulty-selector {
  display: flex;
  align-items: center;
  gap: 5px;
}

.difficulty-selector select {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.sudoku-board {
  display: inline-block;
  border: 2px solid #333;
  margin: 20px auto;
  background-color: white;
}

.sudoku-row {
  display: flex;
  margin: 0;
  padding: 0;
}

.sudoku-cell {
  width: 40px;
  height: 40px;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.sudoku-cell:nth-child(3n) {
  border-right: 2px solid #333;
}

.sudoku-cell:nth-child(9) {
  border-right: none;
}

.sudoku-row:nth-child(3n) .sudoku-cell {
  border-bottom: 2px solid #333;
}

.sudoku-row:last-child .sudoku-cell {
  border-bottom: none;
}

.sudoku-cell.top-border {
  border-top: 2px solid #333;
}

.sudoku-cell.left-border {
  border-left: 2px solid #333;
}

.sudoku-cell input {
  width: 100%;
  height: 100%;
  border: none;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  outline: none;
}

.sudoku-cell input.selected {
  background-color: #d4edda;
}

.sudoku-cell.fixed {
  font-size: 18px;
  font-weight: bold;
  background-color: #f0f0f0;
}

.sudoku-cell.error {
  background-color: #f8d7da;
  color: #721c24;
}

.sudoku-cell.highlight {
  background-color: #fff3cd;
}

.number-pad {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  max-width: 250px;
  margin: 20px auto;
}

.number-btn, .clear-btn {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
  font-size: 16px;
}

.number-btn:hover, .clear-btn:hover {
  background-color: #e0e0e0;
}

.message {
  margin: 15px 0;
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.timer {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-top: 10px;
}

.solved .sudoku-cell input {
  background-color: #d4edda;
  color: #155724;
}
</style>