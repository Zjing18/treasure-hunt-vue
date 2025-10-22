<template>
  <div class="library-page">
    <!-- 音频控制区域 -->
    <div class="audio-controls fade-in-up">
      <div class="audio-info">
        <h4>🎵 bgm</h4>
        <p>music in library</p>
      </div>
      <div class="audio-player">
        <audio ref="audioPlayer" loop>
          <source src="/audio/a2.mp3" type="audio/mpeg">
          您的浏览器不支持音频播放。
        </audio>
        <button class="btn-audio" @click="toggleAudio" :class="{ playing: isPlaying }">
          {{ isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
        </button>
        <div class="volume-control">
          <span>🔊</span>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            v-model="volume"
            @input="updateVolume"
            class="volume-slider"
          >
          <span>{{ Math.round(volume * 100) }}%</span>
        </div>
      </div>
    </div>

    <div class="page-header fade-in-up">
      <h2>🏛️ 古籍图书馆</h2>
      <p>在古老的藏书中寻找关于日影圣匣的线索</p>
      <div class="progress-indicator">
        <span>探索进度: {{ gameStore.progressPercentage }}%</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: gameStore.progressPercentage + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="library-content">
      <!-- 图书馆环境描述 -->
      <div class="library-description fade-in-up" style="animation-delay: 0.1s">
        <p>你走进一座古老的图书馆，空气中弥漫着羊皮纸和墨水的气息。书架高耸入云，上面摆满了各种古籍。</p>
      </div>

      <!-- 书籍探索区域 -->
      <div class="books-section fade-in-up" style="animation-delay: 0.2s">
        <h3>📚 可查阅的古籍</h3>
        <div class="books-grid">
          <div 
            class="book" 
            v-for="book in books" 
            :key="book.id" 
            @click="examineBook(book)"
            :class="{ examined: book.examined }"
          >
            <div class="book-cover">{{ book.emoji }}</div>
            <div class="book-title">{{ book.title }}</div>
            <div class="book-status">{{ book.examined ? '✅ 已查阅' : '🔍 点击查阅' }}</div>
          </div>
        </div>
      </div>

      <!-- 线索搜索区域 -->
      <div class="search-section fade-in-up" style="animation-delay: 0.3s">
        <div class="search-info">
          <h3>🔍 线索搜索</h3>
          <p>查阅完所有古籍后，可以开始搜索关键线索</p>
        </div>
        
        <button 
          class="btn btn-primary" 
          @click="searchForClue" 
          :disabled="searching || !allBooksExamined"
          :class="{ 'btn-disabled': !allBooksExamined }"
        >
          <span v-if="searching">⏳ 搜索中...</span>
          <span v-else-if="!allBooksExamined">📖 请先查阅所有古籍</span>
          <span v-else>🔍 搜索古籍线索</span>
        </button>
        
        <div v-if="searching" class="search-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="search-message">{{ searchMessages[currentMessage] }}</p>
        </div>
      </div>

      <!-- 线索发现区域 -->
      <div v-if="clueFound" class="clue-result fade-in-up">
        <div class="clue-header">
          <h3>🎉 重大发现！</h3>
          <span class="clue-badge">关键线索</span>
        </div>
        <div class="clue-text">
          <p>{{ currentClue.text }}</p>
          <div class="clue-hint" v-if="currentClue.hint">
            <strong>提示：</strong>{{ currentClue.hint }}
          </div>
        </div>
        <div class="clue-actions">
          <button class="btn btn-success" @click="recordClue">
            📝 记录线索 (+100分)
          </button>
          <button class="btn btn-outline" @click="analyzeClue">
            🔬 深入分析
          </button>
        </div>
      </div>

      <!-- 星象谜题区域 -->
      <PuzzleComponent 
        v-if="showPuzzle"
        :puzzle="starPuzzle"
        @puzzleSolved="handlePuzzleSolved"
        @puzzleSkipped="handlePuzzleSkipped" />

      <!-- 下一步导航 -->
      <div v-if="canGoToNextLocation" class="next-step fade-in-up">
        <div class="next-step-content">
          <h3>🚀 准备前往下一个地点</h3>
          <p>你已经获得了关键线索，现在可以前往观星台进行星象解码</p>
          <button class="btn btn-primary" @click="goToObservatory">
            ⭐ 前往观星台
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useRouter } from 'vue-router'
import PuzzleComponent from '../components/game/PuzzleComponent.vue'

export default {
  name: 'LibraryPage',
  components: { PuzzleComponent },
  setup() {
    const gameStore = useGameStore()
    const router = useRouter()
    
    // 音频相关状态
    const audioPlayer = ref(null)
    const isPlaying = ref(false)
    const volume = ref(0.5)
    
    const searching = ref(false)
    const progress = ref(0)
    const currentMessage = ref(0)
    const clueFound = ref(false)
    const showPuzzle = ref(false)
    const currentStep = ref(0) // 0: 初始, 1: 查阅书籍, 2: 搜索线索, 3: 完成
    
    const books = reactive([
      { 
        id: 1, 
        title: '黄昏航路手稿', 
        emoji: '📜', 
        examined: false,
        description: '记载着古代航海家黄昏时分的航行路线'
      },
      { 
        id: 2, 
        title: '星辰航海志', 
        emoji: '📘', 
        examined: false,
        description: '包含详细的星图和航海计算方法'
      },
      { 
        id: 3, 
        title: '古星语铭文', 
        emoji: '🔤', 
        examined: false,
        description: '神秘的古代星象语言记录'
      },
      { 
        id: 4, 
        title: '神庙建筑图', 
        emoji: '🏛️', 
        examined: false,
        description: '展示古代神庙的建筑结构和布局'
      }
    ])
    
    const searchMessages = [
      '翻阅《黄昏航路手稿》，寻找时间线索...',
      '研究《星辰航海志》中的星图排列...',
      '解读《古星语铭文》的神秘符号...',
      '分析《神庙建筑图》的结构特征...',
      '交叉比对所有信息，寻找关联...',
      '发现关键线索！正在整理结果...'
    ]
    
    const clues = [
      {
        text: "根据古籍记载，日影圣匣隐藏在'狮子座升起时对应的神庙方位'。需要结合星象和建筑结构来定位具体位置。",
        hint: "狮子座在夏季夜晚最为明显，结合神庙的朝向可以确定入口方向。",
        points: 150
      },
      {
        text: "黄昏航路手稿提到'月蚀之年，北辰偏东'，结合星辰航海志的星图，圣匣可能位于神庙的东北角。",
        hint: "北辰即北极星，偏东意味着需要向东偏移一定角度。",
        points: 200
      },
      {
        text: "古星语铭文暗示'当三颗主星连成一线时，神庙的秘密通道将会开启'。这可能是找到圣匣的关键时机。",
        hint: "三颗主星可能指猎户座的腰带三星，在冬季夜晚可见。",
        points: 180
      }
    ]
    
    const currentClue = ref({})
    const starPuzzle = {
      type: 'starAlignment',
      title: '星象对齐谜题',
      description: '按照古老星图排列星辰顺序，验证你发现的线索'
    }
    
    // 计算属性
    const allBooksExamined = computed(() => {
      return books.every(book => book.examined)
    })
    
    const examinedBooksCount = computed(() => {
      return books.filter(book => book.examined).length
    })
    
    // 修复：添加正确的条件判断
    const canGoToNextLocation = computed(() => {
      return gameStore.gameProgress.clueFound && 
             allBooksExamined.value && 
             currentStep.value >= 3
    })
    
    // 音频控制方法
    const toggleAudio = () => {
      if (!audioPlayer.value) return
      
      if (isPlaying.value) {
        audioPlayer.value.pause()
      } else {
        audioPlayer.value.play().catch(error => {
          console.error('音频播放失败:', error)
        })
      }
      isPlaying.value = !isPlaying.value
    }
    
    const updateVolume = () => {
      if (audioPlayer.value) {
        audioPlayer.value.volume = volume.value
      }
    }
    
    const handleAudioEnded = () => {
      isPlaying.value = false
    }
    
    // 页面加载时初始化音频
    onMounted(() => {
      if (audioPlayer.value) {
        audioPlayer.value.volume = volume.value
        audioPlayer.value.addEventListener('ended', handleAudioEnded)
        
        // 自动播放背景音乐（可选）
        setTimeout(() => {
          if (!isPlaying.value) {
            toggleAudio()
          }
        }, 1000)
      }
    })
    
    onUnmounted(() => {
      if (audioPlayer.value) {
        audioPlayer.value.removeEventListener('ended', handleAudioEnded)
        audioPlayer.value.pause()
      }
    })
    
    // 方法
    const examineBook = async (book) => {
      if (book.examined) return
      
      book.examined = true
      gameStore.updateScore(20)
      
      // 显示查阅动画
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 如果所有书籍都查阅完毕，自动进入下一步
      if (allBooksExamined.value) {
        currentStep.value = 1
      }
    }
    
    const searchForClue = async () => {
      if (!allBooksExamined.value) return
      
      searching.value = true
      progress.value = 0
      currentMessage.value = 0
      currentStep.value = 2
      
      // 模拟搜索过程
      for (let i = 0; i <= 100; i += 5) {
        progress.value = i
        currentMessage.value = Math.min(Math.floor(i / 17), searchMessages.length - 1)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      searching.value = false
      clueFound.value = true
      currentClue.value = clues[Math.floor(Math.random() * clues.length)]
      currentStep.value = 3
      
      // 获取青铜钥匙
      if (!gameStore.hasKey('bronze-key')) {
        gameStore.obtainKey('bronze-key')
        alert('🔑 在古籍的夹层中发现了一把青铜钥匙！这把钥匙可以解锁神庙的某些区域。')
      }
    }
    
    const recordClue = () => {
      gameStore.updateProgress({ clueFound: true })
      gameStore.updateScore(currentClue.value.points || 100)
      showPuzzle.value = true
    }
    
    const analyzeClue = () => {
      // 深入分析线索，获得额外分数
      gameStore.updateScore(50)
      alert('🔍 经过深入分析，你发现了更多细节！获得额外50分。')
    }
    
    const handlePuzzleSolved = (result) => {
      gameStore.updateScore(result.points || 100)
      gameStore.addItem(result.reward || '星象解码器')
      showPuzzle.value = false
      goToObservatory()
    }
    
    const handlePuzzleSkipped = () => {
      showPuzzle.value = false
      goToObservatory()
    }
    
    const goToObservatory = () => {
      router.push('/observatory')
    }
    
    return {
      gameStore,
      audioPlayer,
      isPlaying,
      volume,
      searching,
      progress,
      currentMessage,
      clueFound,
      showPuzzle,
      books,
      searchMessages,
      currentClue,
      starPuzzle,
      allBooksExamined,
      examinedBooksCount,
      toggleAudio,
      updateVolume,
      searchForClue,
      recordClue,
      analyzeClue,
      examineBook,
      handlePuzzleSolved,
      handlePuzzleSkipped,
      goToObservatory
    }
  }
}
</script>

<style scoped>
.library-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

/* 音频控制样式 */
.audio-controls {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 213, 126, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.audio-info h4 {
  color: #ffd57e;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.audio-info p {
  color: #aaa;
  margin: 0;
  font-size: 0.9rem;
}

.audio-player {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-audio {
  background: linear-gradient(45deg, #ffd57e, #ffa94d);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.btn-audio:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 213, 126, 0.3);
}

.btn-audio.playing {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 25px;
}

.volume-slider {
  width: 80px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #ffd57e;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #ffd57e;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h2 {
  font-size: 2.8rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #ffd57e, #ffa94d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.progress-indicator {
  margin-top: 1rem;
}

.progress-indicator span {
  color: #ffd57e;
  font-weight: 600;
}

.library-description {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  border-left: 4px solid #ffd57e;
}

.library-description p {
  color: #ccc;
  line-height: 1.6;
  margin: 0;
}

.books-section {
  margin-bottom: 3rem;
}

.books-section h3 {
  color: #ffd57e;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.book {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-align: center;
}

.book:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 213, 126, 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.book.examined {
  border-color: #4ecdc4;
  background: rgba(78, 205, 196, 0.1);
}

.book-cover {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.book-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #fff;
}

.book-status {
  font-size: 0.8rem;
  color: #aaa;
}

.search-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-info h3 {
  color: #4ecdc4;
  margin-bottom: 0.5rem;
}

.search-info p {
  color: #aaa;
  margin-bottom: 1.5rem;
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-progress {
  margin-top: 1.5rem;
}

.search-message {
  color: #ffd57e;
  font-style: italic;
  margin-top: 0.5rem;
}

.clue-result {
  background: linear-gradient(135deg, rgba(255, 213, 126, 0.1), rgba(78, 205, 196, 0.1));
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  border: 2px solid rgba(255, 213, 126, 0.3);
}

.clue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.clue-header h3 {
  color: #ffd57e;
  margin: 0;
}

.clue-badge {
  background: #ff4757;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.clue-text p {
  color: #fff;
  line-height: 1.6;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.clue-hint {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #4ecdc4;
}

.clue-hint strong {
  color: #4ecdc4;
}

.clue-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.next-step {
  background: rgba(46, 213, 115, 0.1);
  padding: 2rem;
  border-radius: 15px;
  border: 2px solid rgba(46, 213, 115, 0.3);
  text-align: center;
}

.next-step-content h3 {
  color: #2ed573;
  margin-bottom: 1rem;
}

.next-step-content p {
  color: #ccc;
  margin-bottom: 1.5rem;
}

/* 进度条样式 */
.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd57e, #ffa94d);
  transition: width 0.3s ease;
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audio-controls {
    flex-direction: column;
    text-align: center;
  }
  
  .audio-player {
    justify-content: center;
  }
  
  .library-page {
    padding: 1rem;
  }
  
  .books-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .clue-actions {
    flex-direction: column;
  }
  
  .clue-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>