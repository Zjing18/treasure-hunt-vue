<template>
  <div class="observatory-page">
    <!-- 音频控制区域 -->
    <div class="audio-controls fade-in-up">
      <div class="audio-info">
        <h4>🎵 bgm</h4>
        <p>music in Observatory</p>
      </div>
      <div class="audio-player">
        <audio ref="audioPlayer" loop>
          <source src="/audio/a3.mp3" type="audio/mpeg">
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

    <div class="page-header">
      <h2>🔭 天文观测台</h2>
      <p>使用星象望远镜观察星空，选择正确的星座组合来解码古籍中的线索</p>
    </div>

    <div class="observatory-content">
      <!-- 望远镜交互区域 -->
      <div class="telescope-section">
        <div class="telescope-container">
          <div class="telescope" @click="useTelescope" :class="{ used: telescopeUsed }">
            <div class="telescope-body">🔭</div>
            <div class="telescope-label">{{ telescopeUsed ? '望远镜已校准' : '点击使用望远镜' }}</div>
          </div>
          <div v-if="telescopeUsed" class="observation-hint">
            <p>✨ 通过望远镜观察到了四个主要星座</p>
            <p>请选择至少2个星座进行星象解码</p>
          </div>
        </div>
        
        <!-- 星座选择区域 -->
        <div class="star-chart-section">
          <h3>星图选择</h3>
          <div class="star-chart">
            <div class="constellation" 
                 v-for="constellation in constellations" 
                 :key="constellation.name"
                 :class="{ 
                   active: constellation.active, 
                   disabled: !telescopeUsed 
                 }"
                 @click="toggleConstellation(constellation)">
              <div class="constellation-symbol">{{ constellation.symbol }}</div>
              <div class="constellation-name">{{ constellation.name }}</div>
              <div class="constellation-info">{{ constellation.description }}</div>
            </div>
          </div>
          <div class="selection-status">
            <p>已选择：{{ selectedCount }}/4 个星座</p>
            <div class="selected-constellations">
              <span v-for="constellation in selectedConstellations" 
                    :key="constellation.name"
                    class="selected-constellation">
                {{ constellation.symbol }} {{ constellation.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 解码区域 -->
      <div class="decoding-section">
        <div class="decoding-controls">
          <button class="btn btn-primary" 
                  @click="decodeClue" 
                  :disabled="!canDecode || decoding">
            {{ decoding ? '解码中...' : '开始星象解码' }}
          </button>
          <div class="decoding-requirements">
            <p v-if="!telescopeUsed">🔭 请先使用望远镜观察星空</p>
            <p v-else-if="selectedCount < 2">✨ 请选择至少2个星座</p>
            <p v-else>✅ 可以开始解码</p>
          </div>
        </div>
        
        <!-- 解码过程动画 -->
        <div v-if="decoding" class="decoding-progress">
          <div class="stars-animation">
            <span v-for="n in 8" :key="n" class="twinkle-star">⭐</span>
          </div>
          <div class="decoding-message">
            <p>{{ decodingMessages[currentDecodingMessage] }}</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: decodingProgress + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 解码结果 -->
        <div v-if="decoded" class="decoding-result">
          <div class="result-header">
            <h3>🔭 星象解码成功！</h3>
            <div class="success-animation">✨</div>
          </div>
          <div class="decoded-content">
            <p class="decoded-text">{{ decodedLocation }}</p>
            <p class="decoded-hint">这是古籍中记载的神庙位置线索</p>
          </div>
          <button class="btn btn-success" @click="proceedToTemple">
            🏛️ 前往神庙探索
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

export default {
  name: 'ObservatoryPage',
  setup() {
    const gameStore = useGameStore()
    const router = useRouter()
    
    // 音频相关状态
    const audioPlayer = ref(null)
    const isPlaying = ref(false)
    const volume = ref(0.5)
    
    const telescopeUsed = ref(false)
    const decoding = ref(false)
    const decoded = ref(false)
    const currentDecodingMessage = ref(0)
    const decodingProgress = ref(0)

    const constellations = reactive([
      { 
        name: '大熊座', 
        symbol: '🐻', 
        active: false,
        description: '指引方向的古老星座'
      },
      { 
        name: '狮子座', 
        symbol: '🦁', 
        active: false,
        description: '象征勇气与力量的星座'
      },
      { 
        name: '仙女座', 
        symbol: '👸', 
        active: false,
        description: '连接神话与现实的桥梁'
      },
      { 
        name: '猎户座', 
        symbol: '🏹', 
        active: false,
        description: '猎人的守护星座'
      }
    ])
    
    const decodingMessages = [
      '校准星象望远镜焦距...',
      '匹配古籍中的星图坐标...',
      '计算星体运行轨迹和角度...',
      '解码古老的天文密码...',
      '验证星座组合的正确性...',
      '生成最终的位置线索...'
    ]
    
    const locations = [
      "日影圣匣安眠于西南荒漠的黑曜神庙，需在正午时分观察日影定位",
      "在北极星正下方的古老祭坛中，只有月圆之夜才能显现入口",
      "月影谷的瀑布后面隐藏着入口，需借助月光反射才能发现",
      "需要三颗星辰同时照亮的神庙地基，位于群山环抱的盆地中央"
    ]
    
    const decodedLocation = ref('')
    
    const selectedCount = computed(() => {
      return constellations.filter(c => c.active).length
    })
    
    const selectedConstellations = computed(() => {
      return constellations.filter(c => c.active)
    })
    
    const canDecode = computed(() => {
      return telescopeUsed.value && selectedCount.value >= 2
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
    
    const useTelescope = () => {
      if (!telescopeUsed.value) {
        telescopeUsed.value = true
        gameStore.updateScore(20)
      }
    }
    
    const toggleConstellation = (constellation) => {
      if (!telescopeUsed.value) return
      constellation.active = !constellation.active
    }
    
    const decodeClue = async () => {
      if (!canDecode.value || decoding.value) return
      
      decoding.value = true
      currentDecodingMessage.value = 0
      decodingProgress.value = 0
      
      const totalSteps = decodingMessages.length
      const progressIncrement = 100 / totalSteps
      
      for (let i = 0; i < totalSteps; i++) {
        currentDecodingMessage.value = i
        decodingProgress.value = (i + 1) * progressIncrement
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      decoding.value = false
      decoded.value = true
      decodedLocation.value = locations[Math.floor(Math.random() * locations.length)]
      
      // 获取银钥匙
      if (!gameStore.hasKey('silver-key')) {
        gameStore.obtainKey('silver-key')
      }
      
      gameStore.updateProgress({ locationDecoded: true })
      gameStore.updateScore(150)
    }
    
    const proceedToTemple = () => {
      router.push('/temple')
    }
    
    return {
      audioPlayer,
      isPlaying,
      volume,
      telescopeUsed,
      decoding,
      decoded,
      currentDecodingMessage,
      decodingProgress,
      constellations,
      decodingMessages,
      decodedLocation,
      selectedCount,
      selectedConstellations,
      canDecode,
      toggleAudio,
      updateVolume,
      useTelescope,
      toggleConstellation,
      decodeClue,
      proceedToTemple,
    }
  }
}
</script>

<style scoped>
.observatory-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
}

/* 音频控制样式 */
.audio-controls {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid rgba(78, 205, 196, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.audio-info h4 {
  color: #4ecdc4;
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
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
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
  box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
}

.btn-audio.playing {
  background: linear-gradient(45deg, #ffd57e, #ffa94d);
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
  background: #4ecdc4;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #4ecdc4;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

.observatory-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin-top: 2rem;
}

.telescope-section {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 213, 126, 0.3);
  border-radius: 20px;
  padding: 2rem;
}

.telescope-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.telescope {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.telescope:hover:not(.used) {
  transform: scale(1.05);
}

.telescope.used {
  cursor: default;
}

.telescope-body {
  font-size: 6rem;
  filter: drop-shadow(0 0 20px rgba(255, 213, 126, 0.5));
  transition: all 0.3s ease;
}

.telescope:hover:not(.used) .telescope-body {
  filter: drop-shadow(0 0 30px rgba(255, 213, 126, 0.8));
}

.telescope-label {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: #ffd57e;
  font-weight: 600;
}

.observation-hint {
  background: rgba(78, 205, 196, 0.1);
  border: 1px solid rgba(78, 205, 196, 0.3);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  margin-top: 1rem;
}

.observation-hint p {
  color: #4ecdc4;
  margin: 0.5rem 0;
}

.star-chart-section h3 {
  color: #4ecdc4;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.star-chart {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.constellation {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.constellation:hover:not(.disabled) {
  border-color: rgba(255, 213, 126, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.constellation.active {
  border-color: rgba(74, 222, 128, 0.6);
  background: rgba(74, 222, 128, 0.1);
}

.constellation.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.constellation-symbol {
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
}

.constellation-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffd57e;
  margin-bottom: 0.5rem;
}

.constellation-info {
  font-size: 0.9rem;
  color: #ccc;
  line-height: 1.4;
}

.selection-status {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 213, 126, 0.1);
  border-radius: 12px;
  padding: 1.2rem;
  text-align: center;
}

.selection-status p {
  color: #ffd57e;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.selected-constellations {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.selected-constellation {
  background: rgba(255, 213, 126, 0.2);
  border: 1px solid rgba(255, 213, 126, 0.4);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: #ffd57e;
  font-weight: 500;
}

.decoding-section {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 213, 126, 0.3);
  border-radius: 20px;
  padding: 2rem;
}

.decoding-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.decoding-requirements p {
  color: #ffd57e;
  text-align: center;
  margin: 0.5rem 0;
}

.decoding-progress {
  margin-top: 2rem;
  text-align: center;
}

.stars-animation {
  margin-bottom: 1rem;
}

.twinkle-star {
  display: inline-block;
  margin: 0 0.5rem;
  animation: twinkle 2s infinite;
  animation-delay: calc(var(--n) * 0.2s);
}

.twinkle-star:nth-child(1) { --n: 1; }
.twinkle-star:nth-child(2) { --n: 2; }
.twinkle-star:nth-child(3) { --n: 3; }
.twinkle-star:nth-child(4) { --n: 4; }
.twinkle-star:nth-child(5) { --n: 5; }
.twinkle-star:nth-child(6) { --n: 6; }
.twinkle-star:nth-child(7) { --n: 7; }
.twinkle-star:nth-child(8) { --n: 8; }

.decoding-message p {
  color: #4ecdc4;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto;
  max-width: 400px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4, #ffd57e);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.decoding-result {
  margin-top: 2rem;
  text-align: center;
}

.result-header {
  margin-bottom: 2rem;
}

.result-header h3 {
  color: #4ecdc4;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.success-animation {
  font-size: 3rem;
  animation: successPulse 1.5s infinite;
}

.decoded-content {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.decoded-text {
  color: #ffd57e;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.decoded-hint {
  color: #ccc;
  font-style: italic;
}

@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
}

@keyframes successPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@media (max-width: 768px) {
  .observatory-page {
    padding: 1rem;
  }
  
  .telescope-body {
    font-size: 4rem;
  }
  
  .star-chart {
    grid-template-columns: 1fr;
  }
  
  .constellation-symbol {
    font-size: 2.5rem;
  }
}
</style>