<template>
  <div class="user-profile">
    <!-- 音频控制区域 -->
    <div class="audio-controls">
      <div class="audio-header">
        <h3 class="audio-title">🎵 bgm</h3>
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
      src="/audio/a1.mp3"
      loop
      @ended="handleAudioEnded"
    ></audio>

    <!-- 页面头部 -->
    <div class="profile-header">
      <div class="header-content">
        <h1 class="page-title">探险者档案</h1>
        <p class="page-subtitle">探索未知，记录传奇</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="profile-container">
      <!-- 用户头像和信息卡片 -->
      <div class="user-card">
        <div class="avatar-section">
          <div class="avatar-container">
            <div class="avatar">
              <span class="avatar-icon">👤</span>
            </div>
            <div class="level-badge">Lv.{{ userLevel }}</div>
          </div>
          <div class="user-basic-info">
            <h2 class="username">{{ currentUser.username || '未登录用户' }}</h2>
            <p class="user-title">{{ userTitle }}</p>
            <div class="join-date">加入时间: {{ joinDate }}</div>
            <div class="last-login">最后登录: {{ lastLogin }}</div>
          </div>
        </div>

        <!-- 进度条和积分 -->
        <div class="progress-section">
          <div class="exp-bar">
            <div class="exp-label">
              <span>经验值</span>
              <span>{{ currentUser.highScore || 0 }} / {{ nextLevelExp }}</span>
            </div>
            <div class="exp-progress">
              <div class="exp-fill" :style="{ width: expPercentage + '%' }"></div>
            </div>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">🏆</div>
              <div class="stat-content">
                <div class="stat-value">{{ currentUser.highScore || 0 }}</div>
                <div class="stat-label">最高积分</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🎮</div>
              <div class="stat-content">
                <div class="stat-value">{{ currentUser.gamesPlayed || 0 }}</div>
                <div class="stat-label">游戏次数</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⏱️</div>
              <div class="stat-content">
                <div class="stat-value">{{ bestTimeFormatted }}</div>
                <div class="stat-label">最佳时间</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-value">{{ currentUserRank || '-' }}</div>
                <div class="stat-label">当前排名</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细信息区域 -->
      <div class="details-section">
        <!-- 成就区域 -->
        <div class="achievements-card">
          <h3 class="card-title">🏅 成就徽章</h3>
          <div class="achievements-grid">
            <div class="achievement-item" :class="{ unlocked: hasFirstGame }">
              <div class="achievement-icon">{{ hasFirstGame ? '🎯' : '🔒' }}</div>
              <div class="achievement-info">
                <div class="achievement-name">新手探险家</div>
                <div class="achievement-desc">完成第一个游戏</div>
              </div>
            </div>
            <div class="achievement-item" :class="{ unlocked: hasHighScore }">
              <div class="achievement-icon">{{ hasHighScore ? '⭐' : '🔒' }}</div>
              <div class="achievement-info">
                <div class="achievement-name">积分大师</div>
                <div class="achievement-desc">获得100分以上</div>
              </div>
            </div>
            <div class="achievement-item" :class="{ unlocked: hasMultipleGames }">
              <div class="achievement-icon">{{ hasMultipleGames ? '🏃' : '🔒' }}</div>
              <div class="achievement-info">
                <div class="achievement-name">游戏达人</div>
                <div class="achievement-desc">完成5次游戏</div>
              </div>
            </div>
            <div class="achievement-item" :class="{ unlocked: hasFastTime }">
              <div class="achievement-icon">{{ hasFastTime ? '⚡' : '🔒' }}</div>
              <div class="achievement-info">
                <div class="achievement-name">速度之星</div>
                <div class="achievement-desc">最佳时间少于5分钟</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏统计 -->
        <div class="stats-card">
          <h3 class="card-title">📊 详细统计</h3>
          <div class="stats-list">
            <div class="stat-row">
              <span class="stat-name">用户ID</span>
              <span class="stat-value">{{ currentUser.id || '-' }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-name">邮箱</span>
              <span class="stat-value">{{ currentUser.email || '-' }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-name">最后访问</span>
              <span class="stat-value">{{ lastVisitedLocation }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-name">平均得分</span>
              <span class="stat-value">{{ averageScore }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-name">游戏频率</span>
              <span class="stat-value">{{ gameFrequency }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-name">活跃度</span>
              <span class="stat-value">{{ activityLevel }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 未登录提示 -->
      <div v-if="!userStore.isLoggedIn" class="login-prompt">
        <div class="prompt-content">
          <h3>🔐 请先登录</h3>
          <p>登录后即可查看您的个人资料和游戏数据</p>
          <router-link to="/" class="btn-login-prompt">
            <span class="login-icon">🔑</span>
            <span class="login-text">前往登录</span>
          </router-link>
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
  name: 'UserProfile',
  setup() {
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
        
        // 延迟1秒后自动播放
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

    // 计算用户等级（基于积分）
    const userLevel = computed(() => {
      const score = currentUser.value.highScore || 0
      return Math.floor(score / 100) + 1
    })

    // 计算下一级所需经验
    const nextLevelExp = computed(() => userLevel.value * 100)

    // 计算经验百分比
    const expPercentage = computed(() => {
      const score = currentUser.value.highScore || 0
      const currentLevelExp = (userLevel.value - 1) * 100
      const levelExp = score - currentLevelExp
      return Math.min((levelExp / 100) * 100, 100)
    })

    // 用户标题（基于等级）
    const userTitle = computed(() => {
      const level = userLevel.value
      if (level >= 10) return '传奇探险家'
      if (level >= 5) return '资深探险家'
      if (level >= 3) return '中级探险家'
      return '初级探险家'
    })

    // 格式化最佳时间
    const bestTimeFormatted = computed(() => {
      const bestTime = currentUser.value.bestTime
      if (!bestTime) return '--:--'
      
      const minutes = Math.floor(bestTime / 60)
      const seconds = bestTime % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    })

    // 加入时间格式化
    const joinDate = computed(() => {
      if (!currentUser.value.createdAt) return '未知'
      return new Date(currentUser.value.createdAt).toLocaleDateString('zh-CN')
    })

    // 最后登录时间格式化
    const lastLogin = computed(() => {
      if (!currentUser.value.lastLogin) return '未知'
      return new Date(currentUser.value.lastLogin).toLocaleString('zh-CN')
    })

    // 最后访问地点
    const lastVisitedLocation = computed(() => {
      return currentUser.value.lastVisited || '暂无记录'
    })

    // 平均得分
    const averageScore = computed(() => {
      const games = currentUser.value.gamesPlayed || 0
      const score = currentUser.value.highScore || 0
      return games > 0 ? Math.round(score / games) : 0
    })

    // 游戏频率
    const gameFrequency = computed(() => {
      const games = currentUser.value.gamesPlayed || 0
      if (games === 0) return '新玩家'
      if (games <= 3) return '偶尔游玩'
      if (games <= 10) return '经常游玩'
      return '游戏达人'
    })

    // 活跃度
    const activityLevel = computed(() => {
      const games = currentUser.value.gamesPlayed || 0
      if (games === 0) return '待激活'
      if (games <= 2) return '轻度活跃'
      if (games <= 5) return '中度活跃'
      return '高度活跃'
    })

    // 成就检查
    const hasFirstGame = computed(() => (currentUser.value.gamesPlayed || 0) > 0)
    const hasHighScore = computed(() => (currentUser.value.highScore || 0) >= 100)
    const hasMultipleGames = computed(() => (currentUser.value.gamesPlayed || 0) >= 5)
    const hasFastTime = computed(() => {
      const bestTime = currentUser.value.bestTime
      return bestTime && bestTime <= 300 // 5分钟以内
    })

    // 当前用户数据
    const currentUser = computed(() => userStore.currentUser || {})
    const currentUserRank = computed(() => userStore.currentUserRank)

    // 页面加载时检查登录状态
    onMounted(() => {
      if (!userStore.isLoggedIn) {
        console.log('用户未登录，显示登录提示')
      }
    })

    return {
      audioPlayer,
      isPlaying,
      volume,
      toggleAudio,
      updateVolume,
      handleAudioEnded,
      userStore,
      currentUser,
      currentUserRank,
      userLevel,
      nextLevelExp,
      expPercentage,
      userTitle,
      bestTimeFormatted,
      joinDate,
      lastLogin,
      lastVisitedLocation,
      averageScore,
      gameFrequency,
      activityLevel,
      hasFirstGame,
      hasHighScore,
      hasMultipleGames,
      hasFastTime
    }
  }
}
</script>

<style scoped>
/* 音频控制区域样式 */
.audio-controls {
  position: fixed;
  top: 20px;
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

.user-profile {
  min-height: 100vh;
  position: relative;
  color: white;
  padding: 0;
}

.user-profile::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('../../img/bg1.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: -2;
}

.user-profile::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.8), rgba(0, 10, 30, 0.9));
  z-index: -1;
}

/* 页面头部 */
.profile-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 213, 126, 0.2);
  padding: 3rem 0;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 3rem;
  color: #ffd57e;
  margin: 0;
  text-shadow: 0 0 20px rgba(255, 213, 126, 0.5);
  font-weight: 600;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #ccc;
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
}

/* 主要内容容器 */
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  position: relative;
}

/* 用户卡片 */
.user-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 213, 126, 0.3);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.avatar-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #ffd57e, #ffa94d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(255, 213, 126, 0.4);
}

.avatar-icon {
  font-size: 3rem;
}

.level-badge {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.5rem;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.user-basic-info {
  flex: 1;
}

.username {
  font-size: 2.5rem;
  color: #ffd57e;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 0 10px rgba(255, 213, 126, 0.5);
}

.user-title {
  font-size: 1.2rem;
  color: #4ecdc4;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.join-date, .last-login {
  color: #888;
  font-size: 0.9rem;
  margin: 0.2rem 0;
}

/* 进度条 */
.progress-section {
  margin-top: 2rem;
}

.exp-bar {
  margin-bottom: 2rem;
}

.exp-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #ccc;
  font-size: 0.9rem;
}

.exp-progress {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4, #44a08d);
  border-radius: 4px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 213, 126, 0.3);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: #ffd57e;
  margin-bottom: 0.2rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #ccc;
  opacity: 0.8;
}

/* 详细信息区域 */
.details-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.achievements-card,
.stats-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 213, 126, 0.3);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.card-title {
  font-size: 1.5rem;
  color: #ffd57e;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 0 10px rgba(255, 213, 126, 0.3);
}

.achievements-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.achievement-item.unlocked {
  opacity: 1;
  border-color: rgba(255, 213, 126, 0.5);
  background: rgba(255, 213, 126, 0.1);
}

.achievement-item:not(.unlocked) {
  opacity: 0.6;
}

.achievement-icon {
  font-size: 1.5rem;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: 600;
  color: #ccc;
  margin-bottom: 0.2rem;
}

.achievement-desc {
  font-size: 0.8rem;
  color: #888;
}

.stats-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-name {
  color: #ccc;
}

.stat-value {
  color: #ffd57e;
  font-weight: 600;
}

/* 未登录提示 */
.login-prompt {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 20px;
}

.prompt-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 3rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 213, 126, 0.3);
}

.prompt-content h3 {
  color: #ffd57e;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.prompt-content p {
  color: #ccc;
  margin-bottom: 2rem;
}

.btn-login-prompt {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ffd57e, #ffa94d);
  color: #2c3e50;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-login-prompt:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 213, 126, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audio-controls {
    position: relative;
    top: auto;
    right: auto;
    margin: 1rem;
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

  .profile-container {
    padding: 1rem;
    grid-template-columns: 1fr;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .details-section {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .username {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .audio-controls {
    margin: 0.5rem;
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

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>