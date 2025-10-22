<template>
  <div class="puzzle-container">
    <h3>{{ puzzle.title }}</h3>
    <div class="puzzle-content">
      <p>{{ puzzle.description }}</p>
      
      <!-- 谜题提示区域 -->
      <div v-if="puzzle.type === 'starAlignment'" class="puzzle-hint">
        <div class="hint-header">
          <span class="hint-icon">💡</span>
          <span class="hint-title">谜题提示</span>
          <button class="hint-toggle" @click="toggleHint">
            {{ showHint ? '隐藏提示' : '显示提示' }}
          </button>
        </div>
        <div v-if="showHint" class="hint-content">
          <p><strong>解法提示：</strong>根据古籍记载，需要选择形成"远古三角"的三个星座。</p>
          <p><strong>目标图案：</strong>大熊座 🐻 → 猎户座 🏹 → 天鹅座 🦢</p>
          <p><strong>小技巧：</strong>观察星图上的连线，正确的组合会形成完整的三角形图案。</p>
        </div>
      </div>
      
      <div v-if="puzzle.type === 'starAlignment'" class="star-puzzle">
        <!-- 星象图背景 -->
        <div class="star-map">
          <div class="constellation-lines">
            <svg width="100%" height="100%" class="constellation-svg">
              <!-- 星座连线 -->
              <line v-for="(line, index) in constellationLines" 
                    :key="index"
                    :x1="line.x1" :y1="line.y1" 
                    :x2="line.x2" :y2="line.y2"
                    class="constellation-line" />
            </svg>
          </div>
          
          <!-- 可交互的星星 -->
          <div v-for="(star, index) in stars" 
               :key="index"
               class="star-point"
               :class="{ 
                 selected: selectedStars.includes(index),
                 correct: correctPattern.includes(index)
               }"
               :style="{
                 left: star.position.x + '%',
                 top: star.position.y + '%'
               }"
               @click="toggleStar(index)">
            <div class="star-glow"></div>
            <div class="star-core">{{ star.symbol }}</div>
            <div class="star-label">{{ star.name }}</div>
          </div>
        </div>
        
        <!-- 目标图案提示 -->
        <div class="target-pattern">
          <h4>目标星象图案：{{ targetPatternName }}</h4>
          <div class="pattern-preview">
            <span v-for="symbol in targetPatternSymbols" 
                  :key="symbol"
                  class="pattern-symbol">{{ symbol }}</span>
          </div>
        </div>
        
        <!-- 当前选择状态 -->
        <div class="selection-status">
          <p>已选择：{{ selectedStars.length }}/3 颗星星</p>
          <div class="selected-stars">
            <span v-for="starIndex in selectedStars" 
                  :key="starIndex"
                  class="selected-star">
              {{ stars[starIndex].symbol }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 其他谜题类型保持不变 -->
      <div v-if="puzzle.type === 'symbolMatching'" class="symbol-puzzle">
        <div class="symbols-pair">
          <div v-for="(symbol, index) in symbols" 
               :key="index"
               class="symbol-item"
               @click="selectSymbol(index)">
            {{ symbol }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="puzzle-actions">
      <button @click="solvePuzzle" :disabled="!canSolve" class="solve-btn">解谜</button>
      <button @click="skipPuzzle" class="skip-btn">跳过</button>
    </div>
    
    <div v-if="result" class="puzzle-result" :class="result.type">
      {{ result.message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'PuzzleComponent',
  props: {
    puzzle: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedStars: [],
      selectedSymbols: [],
      result: null,
      showHint: false,
      stars: [
        { 
          name: '大熊座', 
          symbol: '🐻',
          position: { x: 15, y: 25 }
        },
        { 
          name: '仙女座', 
          symbol: '👸',
          position: { x: 60, y: 20 }
        },
        { 
          name: '猎户座', 
          symbol: '🏹',
          position: { x: 35, y: 55 }
        },
        { 
          name: '天琴座', 
          symbol: '🎻',
          position: { x: 55, y: 40 }
        },
        { 
          name: '天鹅座', 
          symbol: '🦢',
          position: { x: 25, y: 45 }
        }
      ],
      // 正确的星象图案（大熊座-猎户座-天鹅座）
      correctPattern: [0, 2, 4],
      targetPatternName: '远古三角',
      targetPatternSymbols: ['🐻', '🏹', '🦢']
    }
  },
  computed: {
    constellationLines() {
      return [
        { x1: '15%', y1: '25%', x2: '35%', y2: '55%' },  // 大熊座到猎户座
        { x1: '35%', y1: '55%', x2: '25%', y2: '45%' },   // 猎户座到天鹅座
        { x1: '25%', y1: '45%', x2: '15%', y2: '25%' }    // 天鹅座到大熊座
      ]
    },
    
    symbols() {
      return ['☀️', '🌙', '⭐', '🌀', '⚡']
    },
    
    canSolve() {
      if (this.puzzle.type === 'starAlignment') {
        return this.selectedStars.length === 3
      }
      return true
    }
  },
  methods: {
    toggleHint() {
      this.showHint = !this.showHint
    },
    
    toggleStar(index) {
      if (this.selectedStars.includes(index)) {
        this.selectedStars = this.selectedStars.filter(i => i !== index)
      } else if (this.selectedStars.length < 3) {
        this.selectedStars.push(index)
      }
    },
    
    selectSymbol(index) {
      this.selectedSymbols = [index]
    },
    
    solvePuzzle() {
      let success = false
      let message = ''
      
      if (this.puzzle.type === 'starAlignment') {
        // 检查是否选择了正确的星象图案
        const isPatternCorrect = this.selectedStars.length === 3 && 
          this.selectedStars.every(starIndex => this.correctPattern.includes(starIndex))
        
        if (isPatternCorrect) {
          success = true
          message = '🌟 星象完美对齐！获得了古老的天文知识'
        } else {
          success = false
          message = '✨ 星象未能正确对齐，请重新尝试'
        }
      } else {
        success = Math.random() > 0.3
        message = success ? '谜题解开了！获得了古老的知识碎片' : '谜题太难了，需要更多时间研究'
      }
      
      if (success) {
        this.result = {
          type: 'success',
          message: message
        }
        this.$emit('puzzleSolved', { 
          reward: this.puzzle.type === 'starAlignment' ? '天文知识' : '知识碎片', 
          points: this.puzzle.type === 'starAlignment' ? 100 : 50 
        })
      } else {
        this.result = {
          type: 'error',
          message: message
        }
      }
    },
    
    skipPuzzle() {
      this.$emit('puzzleSkipped')
    }
  }
}
</script>