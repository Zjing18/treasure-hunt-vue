<template>
  <div class="home-page">
    <!-- 音频播放器 -->
    <audio ref="audioPlayer" loop>
      <source src="../../audio/a1.mp3" type="audio/mpeg">
    </audio>
    
    <div class="hero-section fade-in-up">
      <h1>寻宝游戏</h1>
      <h2>—— 失落的"日影圣匣"</h2>
      
      <!-- 登录区域 -->
      <div class="auth-section">
        <!-- 未登录时显示登录按钮 -->
        <div v-if="!userStore.isLoggedIn && !showLoginForm" class="login-prompt">
          <button class="btn btn-login" @click="showLoginForm = true">
            <span>🔑</span> 登录/注册
          </button>
        </div>
        
        <!-- 登录表单 -->
        <div v-if="!userStore.isLoggedIn && showLoginForm" class="login-form-container">
          <div class="login-form">
            <h3>登录或注册</h3>
            <div class="input-group">
              <label for="username">用户名</label>
              <input 
                id="username"
                v-model="username" 
                placeholder="请输入用户名" 
                @keyup.enter="handleLogin"
                class="form-input"
              />
            </div>
            <div class="input-group">
              <label for="password">密码</label>
              <input 
                id="password"
                type="password"
                v-model="password" 
                placeholder="请输入密码" 
                @keyup.enter="handleLogin"
                class="form-input"
              />
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="handleLogin">
                <span>🔑</span> 登录
              </button>
              <button class="btn btn-outline" @click="handleRegister">
                <span>📝</span> 注册
              </button>
              <button class="btn btn-text" @click="showLoginForm = false">
                取消
              </button>
            </div>
          </div>
        </div>
        
        <!-- 登录后显示用户信息和开始游戏按钮 -->
        <div v-if="userStore.isLoggedIn" class="user-welcome">
          <div class="welcome-content">
            <h3>欢迎，{{ userStore.currentUser.username }}！</h3>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-label">最高分</span>
                <span class="stat-value">{{ userStore.currentUser.highScore || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">游戏次数</span>
                <span class="stat-value">{{ userStore.currentUser.gamesPlayed || 0 }}</span>
              </div>
            </div>
            <button class="btn btn-start-game" @click="startGame">
              <span>🎮</span> 开始游戏
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 全景地图预览框 - 始终显示 -->
    <div class="map-preview-section fade-in-up" style="animation-delay: 0.2s">
      <div class="map-preview-card" @click="goToMapPage">
        <div class="map-preview-content">
          <div class="map-icon">🗺️</div>
          <div class="map-info">
            <h3>全景冒险地图</h3>
            <p>{{ mapPreviewText }}</p>
          </div>
          <div class="map-arrow">➔</div>
        </div>
        <div class="map-mini-view">
          <div class="mini-location" v-for="location in miniLocations" 
               :key="location.id" :class="{ 'active': location.active }"
               :style="location.style">
            <span class="mini-icon">{{ location.icon }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="game-actions fade-in-up" style="animation-delay: 0.4s">
      <button class="btn btn-primary" @click="startGame" :disabled="!userStore.isLoggedIn">
        <span>📚</span> 神秘图书馆
      </button>
      <button class="btn btn-secondary" @click="goToMapPage">
        <span>🗺️</span> 全景地图
      </button>
      <button class="btn btn-outline" @click="goToGuidePage">
        <span>📖</span> 游戏指引
      </button>
      <button class="btn btn-outline" @click="viewLeaderboard" :disabled="!userStore.isLoggedIn">
        <span>🏆</span> 排行榜
      </button>
    </div>
    
    <div class="features-grid fade-in-up" style="animation-delay: 0.6s">
      <div class="feature-card" v-for="feature in features" :key="feature.title">
        <div class="feature-icon">{{ feature.icon }}</div>
        <h4>{{ feature.title }}</h4>
        <p>{{ feature.description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'

export default {
  name: 'HomePage',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const showLoginForm = ref(false)
    const audioPlayer = ref(null)
    
    // 音频控制
    const playAudio = () => {
      if (audioPlayer.value) {
        audioPlayer.value.play().catch(e => console.log('音频播放失败:', e))
      }
    }
    
    const pauseAudio = () => {
      if (audioPlayer.value) {
        audioPlayer.value.pause()
      }
    }
    
    onMounted(() => {
      playAudio()
    })
    
    onUnmounted(() => {
      pauseAudio()
    })
    
    // 计算属性：地图预览文本
    const mapPreviewText = computed(() => {
      if (!userStore.isLoggedIn) {
        return '点击查看全景冒险地图，登录后可解锁更多功能'
      }
      return '点击查看完整的冒险地图，选择你的探险目的地'
    })
    
    // 迷你地图地点配置
    const miniLocations = computed(() => [
      {
        id: 'library',
        icon: '📚',
        style: { top: '30%', left: '20%' },
        active: userStore.isLoggedIn
      },
      {
        id: 'observatory',
        icon: '🔭',
        style: { top: '60%', left: '40%' },
        active: userStore.isLoggedIn && userStore.currentUser?.highScore > 50
      },
      {
        id: 'temple',
        icon: '🏛️',
        style: { top: '40%', left: '70%' },
        active: userStore.isLoggedIn && userStore.currentUser?.highScore > 100
      },
      {
        id: 'treasure',
        icon: '💎',
        style: { top: '20%', left: '50%' },
        active: userStore.isLoggedIn && userStore.currentUser?.highScore > 200
      }
    ])
    
    const features = [
      { 
        icon: '🔍', 
        title: '深度探索', 
        description: '探索古老神庙，解开层层谜题，寻找失落的日影圣匣' 
      },
      { 
        icon: '🧩', 
        title: '智慧解谜', 
        description: '星象解码、古籍研究、机关破解，考验你的智慧与观察力' 
      },
      { 
        icon: '⏱️', 
        title: '时间挑战', 
        description: '增强游戏沉浸感和紧张刺激感' 
      },
      { 
        icon: '🗺️', 
        title: '动态地图', 
        description: '实时显示探索进度和当前位置，助你规划最佳路线' 
      },
      { 
        icon: '🏆', 
        title: '玩家排行', 
        description: '与玩家竞争最高分数，展示你的寻宝实力' 
      },
      { 
        icon: '🎯', 
        title: '成就系统', 
        description: '完成特定挑战解锁成就，记录你的寻宝历程' 
      }
    ]
    
    const handleLogin = () => {
      if (username.value.trim() && password.value.trim()) {
        const user = userStore.loginUser(username.value.trim(), password.value.trim())
        if (user) {
          showLoginForm.value = false
          username.value = ''
          password.value = ''
        } else {
          alert('用户名或密码错误')
        }
      } else {
        alert('请输入用户名和密码')
      }
    }
    
    const handleRegister = () => {
      if (username.value.trim() && password.value.trim()) {
        const user = userStore.registerUser(username.value.trim(), password.value.trim())
        if (user) {
          showLoginForm.value = false
          username.value = ''
          password.value = ''
          alert('注册成功！')
        } else {
          alert('用户名已存在')
        }
      } else {
        alert('请输入用户名和密码')
      }
    }
    
    const startGame = () => {
      if (userStore.isLoggedIn) {
        router.push('/library')
      } else {
        showLoginForm.value = true
      }
    }
    
    const goToMapPage = () => {
      router.push('/map')
    }
    
    const goToGuidePage = () => {
      router.push('/guide')
    }
    
    const viewLeaderboard = () => {
      if (userStore.isLoggedIn) {
        router.push('/leaderboard')
      } else {
        alert('请先登录查看排行榜')
      }
    }
    
    return {
      userStore,
      username,
      password,
      showLoginForm,
      audioPlayer,
      mapPreviewText,
      miniLocations,
      features,
      handleLogin,
      handleRegister,
      startGame,
      goToMapPage,
      goToGuidePage,
      viewLeaderboard
    }
  }
}
</script>

<style scoped>
.home-page {
  text-align: center;
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.home-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('../../img/bg1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -2;
}

.home-page::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.8), rgba(0, 10, 30, 0.9));
  z-index: -1;
}

.home-page > * {
  position: relative;
  z-index: 1;
}
.hero-section {
  margin-bottom: 3rem;
}

.hero-section h1 {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #ffd57e, #ffa94d, #ff7e5f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(255, 213, 126, 0.3);
}

.hero-section h2 {
  font-size: 1.5rem;
  color: #ccc;
  margin-bottom: 2rem;
  font-weight: 300;
}

/* 登录区域样式 */
.auth-section {
  margin-bottom: 2rem;
}

.login-prompt {
  margin-bottom: 1rem;
}

.btn-login {
  background: linear-gradient(45deg, #ffd57e, #ffa94d);
  color: #1a1a2e;
  padding: 1rem 2rem;
  border-radius: 10px;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 213, 126, 0.4);
}

/* 登录表单样式 */
.login-form-container {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 213, 126, 0.3);
  border-radius: 15px;
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.login-form h3 {
  color: #ffd57e;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.input-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.input-group label {
  display: block;
  color: #ffd57e;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(255, 213, 126, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #ffd57e;
  box-shadow: 0 0 10px rgba(255, 213, 126, 0.3);
}

.form-input::placeholder {
  color: #aaa;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-text {
  background: transparent;
  color: #aaa;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.btn-text:hover {
  color: #ffd57e;
}

/* 用户欢迎区域 */
.user-welcome {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 213, 126, 0.3);
  border-radius: 15px;
  padding: 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.welcome-content h3 {
  color: #ffd57e;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}

.user-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #aaa;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffd57e;
}

.btn-start-game {
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: 1rem 2rem;
  border-radius: 10px;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-start-game:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 107, 107, 0.4);
}

/* 全景地图预览框样式 */
.map-preview-section {
  margin-bottom: 3rem;
}

.map-preview-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 213, 126, 0.3);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.map-preview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 213, 126, 0.1), transparent);
  transition: left 0.5s ease;
}

.map-preview-card:hover::before {
  left: 100%;
}

.map-preview-card:hover {
  transform: translateY(-5px);
  border-color: #ffd57e;
  box-shadow: 0 20px 40px rgba(255, 213, 126, 0.3);
}

.map-preview-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.map-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.map-info {
  flex: 1;
  text-align: left;
}

.map-info h3 {
  color: #ffd57e;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.map-info p {
  color: #ccc;
  margin: 0;
  font-size: 1rem;
}

.map-arrow {
  font-size: 2rem;
  color: #ffd57e;
  transition: transform 0.3s ease;
}

.map-preview-card:hover .map-arrow {
  transform: translateX(5px);
}

/* 迷你地图视图 */
.map-mini-view {
  position: relative;
  height: 120px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mini-location {
  position: absolute;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  transform: scale(0.8);
}
.mini-location.active {
  background: linear-gradient(45deg, #ffd57e, #ffa94d);
  transform: scale(1);
  box-shadow: 0 0 15px rgba(255, 213, 126, 0.6);
}
.mini-location:not(.active) {
  opacity: 0.5;
  filter: grayscale(0.7);
}

.mini-icon {
  font-size: 1.2rem;
}

/* 游戏操作按钮 */
.game-actions {
  margin-bottom: 3rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 160px;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-primary {
  background: linear-gradient(45deg, #ffd57e, #ffa94d);
  color: #1a1a2e;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 213, 126, 0.4);
}

.btn-secondary {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(78, 205, 196, 0.4);
}

.btn-outline {
  background: transparent;
  color: #ffd57e;
  border: 2px solid #ffd57e;
}

.btn-outline:hover:not(:disabled) {
  background: rgba(255, 213, 126, 0.1);
  transform: translateY(-2px);
}

/* 特性网格 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 213, 126, 0.1);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: #ffd57e;
  box-shadow: 0 15px 30px rgba(255, 213, 126, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h4 {
  color: #ffd57e;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.feature-card p {
  color: #ccc;
  line-height: 1.6;
  margin: 0;
}

/* 动画效果 */
.fade-in-up {
  animation: fadeInUp 0.8s ease-out;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .home-page {
    padding: 2rem 1rem;
  }
  
  .hero-section h1 {
    font-size: 2.5rem;
  }
  
  .auth-form {
    flex-direction: column;
    gap: 1rem;
  }
  
  .username-input {
    min-width: 200px;
  }
  
  .map-preview-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .map-info {
    text-align: center;
  }
  
  .game-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>