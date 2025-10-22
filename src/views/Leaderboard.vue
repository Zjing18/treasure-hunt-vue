<template>
  <div class="leaderboard-page">
    <!-- 音频控制区域 -->
    <div class="audio-controls">
      <div class="audio-header">
        <h3 class="audio-title">🎵 bgm</h3>
        <div class="audio-buttons">
          <button @click="toggleAudio" class="audio-button" :class="{ playing: isPlaying }">
            {{ isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
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
      src="/audio/a5.mp3"
      loop
      @ended="handleAudioEnded"
    ></audio>

    <!-- 粒子效果 -->
    <div class="particles">
      <div v-for="i in 10" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

    <!-- 页面头部 -->
    <div class="leaderboard-header">
      <div class="header-content">
        <h1>🏆 排行榜</h1>
        <p>看看谁是最强的神庙探险家</p>
        <button class="btn-back" @click="goBack">
          ← 返回
        </button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="leaderboard-filters">
      <button 
        @click="setFilter('score')" 
        :class="{ active: filter === 'score' }"
        class="filter-btn"
      >
        <span class="filter-icon">⭐</span>
        按分数排序
      </button>
      <button 
        @click="setFilter('time')" 
        :class="{ active: filter === 'time' }"
        class="filter-btn"
      >
        <span class="filter-icon">⏱️</span>
        按时间排序
      </button>
    </div>

    <!-- 排行榜列表 -->
    <div class="leaderboard-container">
      <div class="leaderboard-list">
        <!-- 前三名特殊样式 -->
        <div 
          v-for="(user, index) in sortedLeaderboard" 
          :key="user.id"
          class="leaderboard-item"
          :class="{
            'top-1': index === 0,
            'top-2': index === 1,
            'top-3': index === 2,
            current: user.id === userStore.currentUser?.id
          }"
        >
          <div class="rank-badge">
            <span class="rank-number">{{ index + 1 }}</span>
            <div v-if="index < 3" class="rank-crown">
              {{ index === 0 ? '👑' : index === 1 ? '🥈' : '🥉' }}
            </div>
          </div>
          
          <div class="user-info">
            <div class="username">{{ user.username }}</div>
            <div class="stats">
              <span v-if="filter === 'score'" class="score">
                <span class="stat-icon">⭐</span>
                {{ user.highScore }} 分
              </span>
              <span v-else class="time">
                <span class="stat-icon">⏱️</span>
                {{ formatTime(user.bestTime) }}
              </span>
            </div>
          </div>
          
          <div class="games-played">
            <span class="games-icon">🎮</span>
            {{ user.gamesPlayed }} 次
          </div>
        </div>
      </div>
    </div>

    <!-- 当前用户统计 -->
    <div v-if="userStore.isLoggedIn" class="current-user-stats">
      <div class="stats-header">
        <h3>📊 我的统计</h3>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">当前排名</span>
          <span class="stat-value">{{ userRank }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">最高分数</span>
          <span class="stat-value">{{ userStore.currentUser.highScore }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">最佳时间</span>
          <span class="stat-value">{{ formatTime(userStore.currentUser.bestTime) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">游戏次数</span>
          <span class="stat-value">{{ userStore.currentUser.gamesPlayed }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'

export default {
  name: 'Leaderboard',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const filter = ref('score')
    
    // 音频相关状态
    const audioPlayer = ref(null)
    const isPlaying = ref(false)
    const volume = ref(0.7)

    // 播放/暂停音频
    const toggleAudio = () => {
      if (!audioPlayer.value) return
      
      if (isPlaying.value) {
        audioPlayer.value.pause()
      } else {
        audioPlayer.value.play().catch(error => {
          console.log('音频播放失败:', error)
        })
      }
      isPlaying.value = !isPlaying.value
    }

    // 更新音量
    const updateVolume = () => {
      if (audioPlayer.value) {
        audioPlayer.value.volume = volume.value
      }
    }

    // 音频结束处理
    const handleAudioEnded = () => {
      isPlaying.value = false
    }

    const sortedLeaderboard = computed(() => {
      const leaderboard = [...userStore.leaderboard]
      
      if (filter.value === 'score') {
        return leaderboard.sort((a, b) => b.highScore - a.highScore)
      } else {
        return leaderboard.sort((a, b) => (a.bestTime || Infinity) - (b.bestTime || Infinity))
      }
    })
    
    const userRank = computed(() => {
      if (!userStore.currentUser) return '-'
      
      const sorted = sortedLeaderboard.value
      const index = sorted.findIndex(user => user.id === userStore.currentUser.id)
      return index >= 0 ? index + 1 : '-'
    })
    
    const setFilter = (type) => {
      filter.value = type
    }
    
    const formatTime = (seconds) => {
      if (!seconds) return '-'
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
    
    const goBack = () => {
      router.back()
    }
    
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
    
    // 生命周期钩子
    onMounted(() => {
      // 初始化音频设置
      if (audioPlayer.value) {
        audioPlayer.value.volume = volume.value
        // 延迟1秒后自动播放
        setTimeout(() => {
          if (!isPlaying.value) {
            audioPlayer.value.play().catch(error => {
              console.log('自动播放失败:', error)
            })
            isPlaying.value = true
          }
        }, 1000)
      }
    })

    onUnmounted(() => {
      // 清理音频资源
      if (audioPlayer.value) {
        audioPlayer.value.pause()
        audioPlayer.value.currentTime = 0
        audioPlayer.value.removeEventListener('ended', handleAudioEnded)
      }
    })
    
    return {
      userStore,
      filter,
      sortedLeaderboard,
      userRank,
      setFilter,
      formatTime,
      goBack,
      getParticleStyle,
      audioPlayer,
      isPlaying,
      volume,
      toggleAudio,
      updateVolume,
      handleAudioEnded
    }
  }
}
</script>

<style scoped>
/* 音频控制区域样式 */
.audio-controls {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px);
  border-radius: 15px;
  padding: 15px 25px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 213, 126, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 20px;
  z-index: 100;
}

.audio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.audio-title {
  font-size: 1.2rem;
  color: #ffd57e;
  margin: 0;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(255, 213, 126, 0.3);
}

.audio-buttons {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.audio-button {
  background: linear-gradient(135deg, #ffd57e 0%, #ffb347 100%);
  color: #1a1a1a;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  min-width: 80px;
  box-shadow: 0 2px 10px rgba(255, 213, 126, 0.3);
}

.audio-button:hover {
  background: linear-gradient(135deg, #ffb347 0%, #ffd57e 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 213, 126, 0.4);
}

.audio-button.playing {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-icon {
  font-size: 1.1rem;
  color: #ffd57e;
}

.volume-slider {
  width: 80px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffd57e;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffd57e;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.volume-value {
  font-size: 0.9rem;
  color: #ffd57e;
  min-width: 40px;
  text-align: center;
  font-weight: 600;
}

.leaderboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e6e6e6;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* 背景动画效果 */
.leaderboard-page::before {
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

/* 页面头部 */
.leaderboard-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.header-content {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 213, 126, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.leaderboard-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  color: #ffd57e;
  text-shadow: 0 0 20px rgba(255, 213, 126, 0.5);
  font-weight: 700;
}

.leaderboard-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
  color: #ccc;
}

.btn-back {
  background: linear-gradient(135deg, #ffd57e 0%, #ffb347 100%);
  color: #1a1a1a;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 213, 126, 0.4);
}

/* 筛选器 */
.leaderboard-filters {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #e6e6e6;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.filter-btn.active {
  background: linear-gradient(135deg, #ffd57e 0%, #ffb347 100%);
  color: #1a1a1a;
  border-color: #ffd57e;
}

.filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.filter-icon {
  font-size: 1.2rem;
}

/* 排行榜容器 */
.leaderboard-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.leaderboard-list {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 213, 126, 0.3);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.leaderboard-item:last-child {
  border-bottom: none;
}

.leaderboard-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}

/* 前三名特殊样式 */
.leaderboard-item.top-1 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.1) 100%);
  border-left: 4px solid #ffd700;
}

.leaderboard-item.top-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.2) 0%, rgba(128, 128, 128, 0.1) 100%);
  border-left: 4px solid #c0c0c0;
}

.leaderboard-item.top-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(139, 69, 19, 0.1) 100%);
  border-left: 4px solid #cd7f32;
}

.leaderboard-item.current {
  background: rgba(74, 144, 226, 0.2);
  border-left: 4px solid #4a90e2;
}

/* 排名徽章 */
.rank-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 1.5rem;
  min-width: 50px;
}

.rank-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffd57e;
}

.leaderboard-item.top-1 .rank-number {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.leaderboard-item.top-2 .rank-number {
  color: #c0c0c0;
}

.leaderboard-item.top-3 .rank-number {
  color: #cd7f32;
}

.rank-crown {
  font-size: 1.2rem;
  margin-top: 0.3rem;
}

/* 用户信息 */
.user-info {
  flex: 1;
}

.username {
  font-size: 1.2rem;
  font-weight: 600;
  color: #e6e6e6;
  margin-bottom: 0.3rem;
}

.stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #ccc;
}

.stat-icon {
  font-size: 1rem;
}

.games-played {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #888;
  font-size: 0.9rem;
}

.games-icon {
  font-size: 1rem;
}

/* 当前用户统计 */
.current-user-stats {
  max-width: 800px;
  margin: 2rem auto 0;
  background: rgba(74, 144, 226, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(74, 144, 226, 0.3);
  position: relative;
  z-index: 1;
}

.stats-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.stats-header h3 {
  color: #4a90e2;
  font-size: 1.5rem;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #b0b0b0;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.4rem;
  font-weight: 700;
  color: #4ecdc4;
}

/* 粒子效果 */
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

/* 动画关键帧 */
@keyframes backgroundShift {
  0%, 100% { 
    background-position: 0% 50%;
  }
  50% { 
    background-position: 100% 50%;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes particleFloat {
  0%, 100% { 
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10%, 90% { opacity: 1; }
  50% { 
    transform: translateY(-60px) translateX(30px);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audio-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .audio-buttons {
    justify-content: space-between;
  }
  
  .volume-control {
    flex: 1;
    justify-content: space-between;
  }
  
  .volume-slider {
    flex: 1;
    max-width: 100px;
  }

  .leaderboard-page {
    padding: 1rem;
  }
  
  .leaderboard-header h1 {
    font-size: 2.2rem;
  }
  
  .leaderboard-filters {
    flex-direction: column;
    align-items: center;
  }
  
  .filter-btn {
    width: 200px;
    justify-content: center;
  }
  
  .leaderboard-item {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.8rem;
  }
  
  .rank-badge {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .btn-back {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .audio-controls {
    padding: 12px 20px;
    margin-bottom: 20px;
  }
  
  .audio-buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .volume-control {
    justify-content: space-between;
    width: 100%;
  }
  
  .volume-slider {
    flex: 1;
    max-width: none;
  }
}

/* 为每个排行榜项添加延迟动画 */
.leaderboard-item:nth-child(1) { animation-delay: 0.1s; }
.leaderboard-item:nth-child(2) { animation-delay: 0.2s; }
.leaderboard-item:nth-child(3) { animation-delay: 0.3s; }
.leaderboard-item:nth-child(4) { animation-delay: 0.4s; }
.leaderboard-item:nth-child(5) { animation-delay: 0.5s; }
.leaderboard-item:nth-child(6) { animation-delay: 0.6s; }
.leaderboard-item:nth-child(7) { animation-delay: 0.7s; }
.leaderboard-item:nth-child(8) { animation-delay: 0.8s; }
.leaderboard-item:nth-child(9) { animation-delay: 0.9s; }
.leaderboard-item:nth-child(10) { animation-delay: 1.0s; }
</style>