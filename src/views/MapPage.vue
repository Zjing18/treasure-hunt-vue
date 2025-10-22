<template>
  <div class="map-page">
    <!-- 音频控制区域 -->
    <div class="audio-control-section">
      <h3>🎵 bgm</h3>
      <div class="audio-controls">
        <audio ref="audioPlayer" loop>
          <source src="/audio/b1.mp3" type="audio/mpeg">
          您的浏览器不支持音频播放。
        </audio>
        <button class="audio-btn" @click="toggleAudio" :class="{ playing: isPlaying }">
          {{ isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
        </button>
        <div class="volume-control">
          <span>🔊</span>
          <input type="range" min="0" max="1" step="0.1" v-model="volume" @input="updateVolume" class="volume-slider">
          <span>{{ Math.round(volume * 100) }}%</span>
        </div>
      </div>
    </div>

    <!-- 页面头部 -->
    <div class="map-header">
      <button class="back-btn" @click="goBack">
        <span>←</span> 返回首页
      </button>
      <h1>🗺️ 全景冒险地图</h1>
      <p>选择你的探险目的地，开始寻宝之旅</p>
    </div>
    
    <!-- 全景地图容器 -->
    <div class="panoramic-map-container">
      <!-- 地图背景 -->
      <div class="map-background">
        <div class="map-sky"></div>
        <div class="map-mountains"></div>
        <div class="map-forest"></div>
        <div class="map-river"></div>
        <div class="map-plains"></div>
      </div>
      
      <!-- 动态装饰 -->
      <div class="map-decorations">
        <div class="decoration cloud-1"></div>
        <div class="decoration cloud-2"></div>
        <div class="decoration cloud-3"></div>
        <div class="decoration bird-1">🐦</div>
        <div class="decoration bird-2">🦅</div>
        <div class="decoration sun">☀️</div>
      </div>
      
      <!-- 地图地点 -->
      <div class="map-locations">
        <div 
          v-for="location in mapLocations" 
          :key="location.id"
          class="map-location"
          :class="{ 'active': location.active, 'locked': !location.active }"
          :style="location.style"
          @click="navigateToLocation(location)"
          @mouseenter="hoverLocation = location.id"
          @mouseleave="hoverLocation = null"
        >
          <div class="location-icon">{{ location.icon }}</div>
          <div class="location-glow" v-if="location.active"></div>
          <div class="location-tooltip" v-if="hoverLocation === location.id">
            <h4>{{ location.name }}</h4>
            <p>{{ location.description }}</p>
            <span v-if="!location.active" class="lock-info">
              🔒 需要 {{ location.requirement }} 分解锁
            </span>
            <span v-else class="click-hint">点击进入</span>
          </div>
        </div>
      </div>
      
      <!-- 玩家当前位置 -->
      <div class="player-position" :style="playerPosition">
        <div class="player-marker">👤</div>
        <div class="player-glow"></div>
      </div>
    </div>
    
    <!-- 地图图例 -->
    <div class="map-legend">
      <div class="legend-item">
        <div class="legend-dot active"></div>
        <span>可访问地点</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot locked"></div>
        <span>待解锁地点</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot player"></div>
        <span>当前位置</span>
      </div>
    </div>
    
    <!-- 快速导航卡片 -->
    <div class="quick-navigation">
      <h3>快速导航</h3>
      <div class="nav-cards">
        <div 
          v-for="nav in quickNavs" 
          :key="nav.path"
          class="nav-card"
          @click="router.push(nav.path)"
        >
          <div class="nav-icon">{{ nav.icon }}</div>
          <div class="nav-content">
            <h4>{{ nav.title }}</h4>
            <p>{{ nav.description }}</p>
          </div>
          <div class="nav-arrow">➔</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'

export default {
  name: 'MapPage',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const hoverLocation = ref(null)
    
    // 音频相关状态
    const audioPlayer = ref(null)
    const isPlaying = ref(false)
    const volume = ref(0.5)
    
    // 玩家当前位置（基于最近访问的地点）
    const playerPosition = computed(() => {
      const lastVisited = userStore.currentUser?.lastVisited || 'library'
      const positionMap = {
        'library': { top: '35%', left: '25%' },
        'observatory': { top: '65%', left: '45%' },
        'temple': { top: '45%', left: '75%' },
        'treasure': { top: '25%', left: '55%' },
        'leaderboard': { top: '70%', left: '80%' },
        'profile': { top: '10%', left: '10%' }
      }
      return positionMap[lastVisited] || { top: '35%', left: '25%' }
    })
    
    // 全景地图地点配置
    const mapLocations = reactive([
      {
        id: 'library',
        name: '神秘图书馆',
        icon: '📚',
        path: '/library',
        style: { top: '30%', left: '20%' },
        active: true,
        description: '研究古籍，寻找线索',
        requirement: 0
      },
      {
        id: 'observatory',
        name: '古老天文台',
        icon: '🔭',
        path: '/observatory',
        style: { top: '60%', left: '40%' },
        active: userStore.currentUser?.highScore > 50,
        description: '观测星象，解码秘密',
        requirement: 50
      },
      {
        id: 'temple',
        name: '失落神庙',
        icon: '🏛️',
        path: '/temple',
        style: { top: '40%', left: '70%' },
        active: userStore.currentUser?.highScore > 100,
        description: '探索神庙，解开谜题',
        requirement: 100
      },
      {
        id: 'treasure',
        name: '宝藏密室',
        icon: '💎',
        path: '/treasure',
        style: { top: '20%', left: '50%' },
        active: userStore.currentUser?.highScore > 200,
        description: '寻找最终的宝藏',
        requirement: 200
      },
      {
        id: 'leaderboard',
        name: '英雄殿堂',
        icon: '🏆',
        path: '/leaderboard',
        style: { top: '70%', left: '80%' },
        active: true,
        description: '查看排行榜，挑战自我',
        requirement: 0
      },
      {
        id: 'profile',
        name: '个人档案',
        icon: '👤',
        path: '/profile',
        style: { top: '10%', left: '10%' },
        active: true,
        description: '查看个人成就',
        requirement: 0
      }
    ])
    
    // 快速导航
    const quickNavs = [
      {
        icon: '📚',
        title: '神秘图书馆',
        description: '研究古籍，寻找线索',
        path: '/library'
      },
      {
        icon: '🔭',
        title: '古老天文台',
        description: '观测星象，解码秘密',
        path: '/observatory'
      },
      {
        icon: '🏛️',
        title: '失落神庙',
        description: '探索神庙，解开谜题',
        path: '/temple'
      },
      {
        icon: '🏆',
        title: '英雄殿堂',
        description: '查看排行榜，挑战自我',
        path: '/leaderboard'
      }
    ]
    
    // 音频控制方法
    const toggleAudio = () => {
      if (audioPlayer.value) {
        if (isPlaying.value) {
          audioPlayer.value.pause()
        } else {
          audioPlayer.value.play()
        }
        isPlaying.value = !isPlaying.value
      }
    }
    
    const updateVolume = () => {
      if (audioPlayer.value) {
        audioPlayer.value.volume = volume.value
      }
    }
    
    const handleAudioEnded = () => {
      isPlaying.value = false
    }
    
    // 导航到地点
    const navigateToLocation = (location) => {
      if (location.active) {
        // 更新最后访问位置
        userStore.updateLastVisited(location.id)
        router.push(location.path)
      } else {
        alert(`需要达到 ${location.requirement} 分才能解锁 ${location.name}`)
      }
    }
    
    // 返回首页
    const goBack = () => {
      router.push('/')
    }
    
    // 页面加载动画
    onMounted(() => {
      // 添加页面进入动画
      document.querySelector('.map-page').classList.add('page-enter')
      
      // 初始化音频播放器
      if (audioPlayer.value) {
        audioPlayer.value.volume = volume.value
        audioPlayer.value.addEventListener('ended', handleAudioEnded)
        
        // 1秒后自动播放音频
        setTimeout(() => {
          if (audioPlayer.value && !isPlaying.value) {
            audioPlayer.value.play()
            isPlaying.value = true
          }
        }, 1000)
      }
    })
    
    onUnmounted(() => {
      // 清理音频事件监听器
      if (audioPlayer.value) {
        audioPlayer.value.removeEventListener('ended', handleAudioEnded)
        audioPlayer.value.pause()
      }
    })
    
    return {
      // 音频相关
      audioPlayer,
      isPlaying,
      volume,
      toggleAudio,
      updateVolume,
      
      // 原有状态和方法
      userStore,
      mapLocations,
      quickNavs,
      hoverLocation,
      playerPosition,
      navigateToLocation,
      goBack,
      router
    }
  }
}
</script>

<style scoped>
/* 音频控制区域样式 */
.audio-control-section {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(74, 107, 136, 0.5);
  border-radius: 15px;
  padding: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.audio-control-section h3 {
  color: #4a6b88;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.audio-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.audio-btn {
  background: linear-gradient(135deg, #4a6b88 0%, #5a7b98 100%);
  border: none;
  border-radius: 25px;
  color: white;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(74, 107, 136, 0.3);
}

.audio-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 107, 136, 0.4);
}

.audio-btn.playing {
  background: linear-gradient(135deg, #5a7b98 0%, #6a8ba8 100%);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(74, 107, 136, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

.volume-slider {
  width: 100px;
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
  background: #4a6b88;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4a6b88;
  cursor: pointer;
  border: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audio-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .volume-control {
    width: 100%;
    justify-content: space-between;
  }
  
  .volume-slider {
    flex: 1;
    margin: 0 0.5rem;
  }
}

.map-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 2rem;
  position: relative;
  overflow-x: hidden;
}

.map-page.page-enter {
  animation: pageEnter 0.8s ease-out;
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 页面头部 */
.map-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 213, 126, 0.3);
  color: #ffd57e;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  background: rgba(255, 213, 126, 0.1);
  transform: translateY(-50%) translateX(-5px);
}

.map-header h1 {
  font-size: 3rem;
  color: #ffd57e;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px rgba(255, 213, 126, 0.5);
}

.map-header p {
  color: #ccc;
  font-size: 1.2rem;
  margin: 0;
}

/* 全景地图容器 */
.panoramic-map-container {
  position: relative;
  height: 600px;
  max-width: 1000px;
  margin: 0 auto 3rem;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 213, 126, 0.3);
}

/* 地图背景 */
.map-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.map-sky {
  position: absolute;
  top: 0;
  width: 100%;
  height: 70%;
  background: linear-gradient(180deg, #3498db 0%, #2980b9 100%);
}

.map-mountains {
  position: absolute;
  bottom: 30%;
  width: 100%;
  height: 40%;
  background: linear-gradient(0deg, #7f8c8d 0%, #95a5a6 100%);
  clip-path: polygon(0% 100%, 15% 40%, 30% 60%, 45% 20%, 60% 50%, 75% 30%, 90% 70%, 100% 100%);
}

.map-forest {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 30%;
  background: linear-gradient(0deg, #2d5a27 0%, #3a7a32 100%);
}

.map-river {
  position: absolute;
  bottom: 15%;
  left: 10%;
  width: 80%;
  height: 3%;
  background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
  border-radius: 10px;
}

.map-plains {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 15%;
  background: linear-gradient(0deg, #27ae60 0%, #2ecc71 100%);
}

/* 动态装饰 */
.map-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.decoration {
  position: absolute;
  animation: float-slow 30s infinite linear;
}

.cloud-1 {
  top: 15%;
  left: 5%;
  width: 120px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 60px;
  animation-duration: 40s;
}

.cloud-2 {
  top: 25%;
  right: 10%;
  width: 100px;
  height: 40px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50px;
  animation-duration: 35s;
}

.cloud-3 {
  top: 10%;
  left: 60%;
  width: 80px;
  height: 30px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 40px;
  animation-duration: 45s;
}

.bird-1, .bird-2 {
  font-size: 2rem;
  animation-duration: 20s;
}

.bird-1 {
  top: 20%;
  left: 2%;
}

.bird-2 {
  top: 30%;
  right: 5%;
}

.sun {
  top: 5%;
  right: 8%;
  font-size: 4rem;
  animation: rotate 60s infinite linear;
}

@keyframes float-slow {
  0% {
    transform: translateX(-100px);
  }
  100% {
    transform: translateX(calc(100vw + 100px));
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 地图地点 */
.map-locations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.map-location {
  position: absolute;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 10;
  transform: scale(1);
}

.map-location.active {
  background: linear-gradient(45deg, #ffd57e, #ffa94d);
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(255, 213, 126, 0.6);
}

.map-location.locked {
  background: rgba(128, 128, 128, 0.7);
  cursor: not-allowed;
  opacity: 0.6;
  transform: scale(0.9);
}

.map-location.active:hover {
  transform: scale(1.2);
  box-shadow: 0 0 40px rgba(255, 213, 126, 0.8);
}

.location-icon {
  font-size: 2.5rem;
  z-index: 2;
}

.location-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 213, 126, 0.4);
  animation: pulse 2s infinite;
  z-index: 1;
}

.location-tooltip {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.95);
  color: white;
  padding: 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  white-space: nowrap;
  z-index: 20;
  border: 2px solid rgba(255, 213, 126, 0.5);
  text-align: center;
  min-width: 150px;
}

.location-tooltip h4 {
  color: #ffd57e;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.location-tooltip p {
  margin: 0 0 0.5rem 0;
  color: #ccc;
}

.lock-info {
  color: #ff6b6b;
  font-size: 0.8rem;
}

.click-hint {
  color: #4ecdc4;
  font-size: 0.8rem;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

/* 玩家位置 */
.player-position {
  position: absolute;
  width: 60px;
  height: 60px;
  z-index: 15;
}

.player-marker {
  font-size: 2rem;
  animation: bounce 2s infinite;
}

.player-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(78, 205, 196, 0.3);
  animation: pulse 3s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 地图图例 */
.map-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ccc;
  font-size: 0.9rem;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.active {
  background: linear-gradient(45deg, #ffd57e, #ffa94d);
}

.legend-dot.locked {
  background: rgba(128, 128, 128, 0.7);
}

.legend-dot.player {
  background: #4ecdc4;
}

/* 快速导航 */
.quick-navigation {
  max-width: 1000px;
  margin: 0 auto;
}

.quick-navigation h3 {
  color: #ffd57e;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.nav-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 213, 126, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-card:hover {
  transform: translateY(-5px);
  border-color: #ffd57e;
  box-shadow: 0 15px 30px rgba(255, 213, 126, 0.2);
}

.nav-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.nav-content {
  flex: 1;
  text-align: left;
}

.nav-content h4 {
  color: #ffd57e;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.nav-content p {
  color: #ccc;
  margin: 0;
  font-size: 0.9rem;
}

.nav-arrow {
  color: #ffd57e;
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.nav-card:hover .nav-arrow {
  transform: translateX(5px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map-page {
    padding: 1rem;
  }
  
  .map-header h1 {
    font-size: 2rem;
  }
  
  .panoramic-map-container {
    height: 400px;
  }
  
  .map-location {
    width: 60px;
    height: 60px;
  }
  
  .location-icon {
    font-size: 2rem;
  }
  
  .nav-cards {
    grid-template-columns: 1fr;
  }
  
  .map-legend {
    gap: 1rem;
  }
}
</style>