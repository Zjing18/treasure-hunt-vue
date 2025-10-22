<template>
  <div class="treasure-page">
    <!-- 音频控制区域 -->
    <div class="audio-controls">
      <div class="audio-header">
        <h3 class="audio-title">🎵 bgm in TreasurePage</h3>
        <div class="audio-buttons">
          <button 
            @click="toggleAudio" 
            class="audio-btn"
            :class="{ playing: isPlaying }"
          >
            {{ isPlaying ? '⏸️' : '▶️' }}
            <span class="btn-text">{{ isPlaying ? '暂停' : '播放' }}</span>
          </button>
          <div class="volume-control">
            <span class="volume-icon">🔊</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              v-model="volume"
              @input="updateVolume"
              class="volume-slider"
            />
            <span class="volume-value">{{ Math.round(volume * 100) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 音频元素 -->
    <audio 
      ref="audioPlayer"
      src="/audio/a4.mp3"
      loop
      @ended="handleAudioEnded"
    ></audio>

    <!-- 粒子效果 -->
    <div class="particles">
      <div v-for="i in 15" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

    <div class="treasure-hero">
      <h1>🎉 恭喜你找到了日影圣匣！</h1>
      <p>古老的宝藏终于重见天日</p>
    </div>

    <div class="treasure-content">
      <div class="treasure-display">
        <div class="treasure-chest">💎</div>
        <div class="treasure-glow"></div>
      </div>

      <div class="treasure-rewards">
        <h3>获得奖励</h3>
        <div class="reward-item" v-for="reward in rewards" :key="reward.name">
          <span class="reward-icon">{{ reward.emoji }}</span>
          <span class="reward-name">{{ reward.name }}</span>
          <span class="reward-value">+{{ reward.value }}</span>
        </div>
      </div>

      <div class="game-stats">
        <h3>游戏统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">最终分数</span>
            <span class="stat-value">{{ finalScore }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">游戏时间</span>
            <span class="stat-value">{{ formatTime(gameTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">收集物品</span>
            <span class="stat-value">{{ collectedItems.length }} 件</span>
          </div>
        </div>
      </div>

      <div class="completion-actions">
        <button class="btn btn-primary" @click="saveGameResult">保存成绩</button>
        <router-link to="/leaderboard" class="btn btn-secondary">查看排行榜</router-link>
        <button class="btn btn-outline" @click="startNewGame">重新开始</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'

export default {
  name: 'TreasurePage',
  setup() {
    const gameStore = useGameStore()
    const userStore = useUserStore()
    const router = useRouter()
    
    // 音频相关状态
    const audioPlayer = ref(null)
    const isPlaying = ref(false)
    const volume = ref(0.7)

    // 音频控制方法
    const toggleAudio = () => {
      if (!audioPlayer.value) return
      
      if (isPlaying.value) {
        audioPlayer.value.pause()
      } else {
        audioPlayer.value.play().catch(error => {
          console.error('播放音频失败:', error)
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

    // 初始化音频
    onMounted(() => {
      if (audioPlayer.value) {
        audioPlayer.value.volume = volume.value
        
        // 延迟1秒后自动播放庆祝音乐
        setTimeout(() => {
          if (!isPlaying.value) {
            toggleAudio()
          }
        }, 1000)
      }
    })

    // 清理音频
    onUnmounted(() => {
      if (audioPlayer.value) {
        audioPlayer.value.pause()
        audioPlayer.value = null
      }
    })
    
    const gameTime = ref(0)
    const timer = ref(null)
    
    const rewards = computed(() => [
      { name: '基础分数', emoji: '⭐', value: 500 },
      { name: '时间奖励', emoji: '⏱️', value: Math.max(0, 300 - gameTime.value) },
      { name: '物品收集', emoji: '🎒', value: gameStore.collectedItems.length * 50 },
      { name: '完美探索', emoji: '🏆', value: 200 }
    ])
    
    const finalScore = computed(() => {
      return rewards.value.reduce((total, reward) => total + reward.value, 0)
    })
    
    const collectedItems = computed(() => gameStore.collectedItems)
    
    // 粒子效果样式生成
    const getParticleStyle = (index) => {
      const left = Math.random() * 100
      const top = Math.random() * 100
      const size = Math.random() * 2 + 1
      const duration = Math.random() * 5 + 6
      const delay = Math.random() * 3
      
      return {
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }
    }
    
    onMounted(() => {
      // 模拟游戏时间（实际项目中应该从游戏开始计时）
      gameTime.value = Math.floor(Math.random() * 600) + 300 // 5-15分钟
      
      timer.value = setInterval(() => {
        gameTime.value += 1
      }, 1000)
    })
    
    onUnmounted(() => {
      if (timer.value) {
        clearInterval(timer.value)
      }
    })
    
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
    
    const saveGameResult = () => {
      if (userStore.isLoggedIn) {
        userStore.updateUserStats(gameTime.value, finalScore.value)
        alert('游戏成绩已保存！')
      } else {
        alert('请先登录以保存成绩')
        router.push('/')
      }
    }
    
    const startNewGame = () => {
      gameStore.resetGame()
      router.push('/')
    }
    
    return {
      audioPlayer,
      isPlaying,
      volume,
      toggleAudio,
      updateVolume,
      handleAudioEnded,
      gameTime,
      rewards,
      finalScore,
      collectedItems,
      formatTime,
      saveGameResult,
      startNewGame,
      getParticleStyle
    }
  }
}
</script>

<style scoped>
/* 音频控制区域样式 */
.audio-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 213, 126, 0.3);
  border-radius: 15px;
  padding: 1rem;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  min-width: 280px;
}

.audio-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.audio-title {
  color: #ffd57e;
  font-size: 1rem;
  margin: 0;
  text-align: center;
  text-shadow: 0 0 10px rgba(255, 213, 126, 0.3);
}

.audio-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.audio-btn {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  border: none;
  border-radius: 10px;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  min-width: 80px;
  justify-content: center;
}

.audio-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
}

.audio-btn.playing {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
}

.btn-text {
  font-size: 0.9rem;
  font-weight: 600;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.volume-icon {
  font-size: 1.2rem;
  color: #ffd57e;
}

.volume-slider {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
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
  cursor: pointer;
  border: none;
}

.volume-value {
  color: #ccc;
  font-size: 0.8rem;
  min-width: 40px;
  text-align: center;
}

.treasure-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e6e6e6;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow: hidden;
}

/* 背景动画效果 */
.treasure-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 213, 126, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(74, 144, 226, 0.1) 0%, transparent 50%);
  animation: backgroundShift 10s ease-in-out infinite;
  z-index: 0;
}

.treasure-hero {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
}

.treasure-hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: #ffd57e;
  text-shadow: 0 0 20px rgba(255, 213, 126, 0.5);
  font-weight: 700;
  letter-spacing: 1px;
  animation: titleGlow 3s ease-in-out infinite alternate;
}

.treasure-hero p {
  font-size: 1.3rem;
  opacity: 0.9;
  color: #ccc;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  animation: fadeInUp 1s ease-out;
}

.treasure-content {
  max-width: 900px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 213, 126, 0.2);
  position: relative;
  z-index: 1;
  animation: slideInUp 1s ease-out;
  border: 1px solid rgba(255, 213, 126, 0.3);
}

.treasure-display {
  position: relative;
  text-align: center;
  margin-bottom: 3rem;
}

.treasure-chest {
  font-size: 10rem;
  animation: 
    treasureFloat 4s ease-in-out infinite,
    treasureGlow 3s ease-in-out infinite alternate;
  filter: drop-shadow(0 0 25px rgba(255, 213, 126, 0.6));
  display: inline-block;
}

.treasure-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, 
    rgba(255, 213, 126, 0.4) 0%, 
    rgba(255, 179, 71, 0.3) 30%, 
    rgba(255, 140, 0, 0.2) 60%, 
    transparent 80%);
  border-radius: 50%;
  animation: 
    glowPulse 4s ease-in-out infinite,
    glowRotate 15s linear infinite;
  z-index: -1;
}

.treasure-rewards {
  background: rgba(255, 213, 126, 0.1);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 213, 126, 0.3);
  animation: fadeIn 1s ease-out 0.5s both;
}

.treasure-rewards h3 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
  color: #ffd57e;
  text-shadow: 0 0 10px rgba(255, 213, 126, 0.5);
  font-weight: 600;
}

.reward-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideInLeft 0.6s ease-out;
  animation-fill-mode: both;
}

.reward-item:nth-child(1) { animation-delay: 0.7s; }
.reward-item:nth-child(2) { animation-delay: 0.9s; }
.reward-item:nth-child(3) { animation-delay: 1.1s; }
.reward-item:nth-child(4) { animation-delay: 1.3s; }

.reward-item:last-child {
  border-bottom: none;
}

.reward-icon {
  font-size: 2rem;
  margin-right: 1rem;
  animation: iconBounce 2s ease-in-out infinite;
}

.reward-name {
  flex: 1;
  font-weight: 500;
  font-size: 1.1rem;
  color: #e0e0e0;
}

.reward-value {
  font-weight: bold;
  font-size: 1.2rem;
  color: #ffd57e;
  text-shadow: 0 0 5px rgba(255, 213, 126, 0.5);
  animation: numberPulse 2s ease-in-out infinite;
}

.game-stats {
  background: rgba(74, 144, 226, 0.1);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(74, 144, 226, 0.3);
  animation: fadeIn 1s ease-out 1s both;
}

.game-stats h3 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
  color: #4a90e2;
  text-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: statSlideIn 0.8s ease-out;
  animation-fill-mode: both;
}

.stat-item:nth-child(1) { animation-delay: 1.2s; }
.stat-item:nth-child(2) { animation-delay: 1.4s; }
.stat-item:nth-child(3) { animation-delay: 1.6s; }

.stat-label {
  display: block;
  font-size: 0.95rem;
  opacity: 0.8;
  margin-bottom: 0.8rem;
  color: #b0b0b0;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #4ecdc4;
  text-shadow: 0 0 5px rgba(78, 205, 196, 0.5);
  animation: valueGlow 3s ease-in-out infinite;
}

.completion-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeIn 1s ease-out 1.8s both;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  position: relative;
  overflow: hidden;
  letter-spacing: 1px;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #ffd57e 0%, #ffb347 100%);
  color: #1a1a1a;
  box-shadow: 0 4px 15px rgba(255, 213, 126, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 213, 126, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* 动画关键帧 */
@keyframes backgroundShift {
  0%, 100% { 
    background-position: 0% 50%;
  }
  50% { 
    background-position: 100% 50%;
  }
}

@keyframes titleGlow {
  0% { 
    text-shadow: 0 0 20px rgba(255, 213, 126, 0.5);
  }
  100% { 
    text-shadow: 0 0 30px rgba(255, 213, 126, 0.8), 0 0 40px rgba(255, 213, 126, 0.6);
  }
}

@keyframes treasureFloat {
  0%, 100% { 
    transform: translateY(0px); 
  }
  50% { 
    transform: translateY(-15px); 
  }
}

@keyframes treasureGlow {
  0% { 
    filter: drop-shadow(0 0 25px rgba(255, 213, 126, 0.6));
  }
  100% { 
    filter: drop-shadow(0 0 35px rgba(255, 213, 126, 0.9));
  }
}

@keyframes glowPulse {
  0%, 100% { 
    opacity: 0.5; 
    transform: translate(-50%, -50%) scale(1);
  }
  50% { 
    opacity: 0.8; 
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes glowRotate {
  0% { 
    transform: translate(-50%, -50%) rotate(0deg); 
  }
  100% { 
    transform: translate(-50%, -50%) rotate(360deg); 
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes statSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes numberPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes valueGlow {
  0%, 100% { 
    text-shadow: 0 0 5px rgba(78, 205, 196, 0.5);
  }
  50% { 
    text-shadow: 0 0 10px rgba(78, 205, 196, 0.8);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audio-controls {
    position: fixed;
    bottom: 10px;
    right: 10px;
    left: 10px;
    margin: 0;
    min-width: auto;
  }
  
  .audio-header {
    flex-direction: row;
    align-items: center;
  }
  
  .audio-title {
    text-align: left;
    flex: 1;
  }
  
  .audio-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .volume-control {
    width: 100%;
  }

  .treasure-hero h1 {
    font-size: 2.5rem;
  }
  
  .treasure-chest {
    font-size: 6rem;
  }
  
  .treasure-content {
    padding: 2rem;
    margin: 1rem;
  }
  
  .completion-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
    margin-bottom: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .audio-controls {
    bottom: 5px;
    right: 5px;
    left: 5px;
    margin: 0;
    padding: 0.8rem;
  }
  
  .audio-header {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .audio-title {
    font-size: 0.9rem;
  }
  
  .audio-btn {
    min-width: 70px;
    padding: 0.4rem 0.8rem;
  }
}

/* 添加粒子效果容器 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 213, 126, 0.6);
  border-radius: 50%;
  animation: particleFloat 8s ease-in-out infinite;
}

@keyframes particleFloat {
  0%, 100% { 
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10%, 90% { opacity: 1; }
  50% { 
    transform: translateY(-80px) translateX(40px);
    opacity: 0;
  }
}
</style>
