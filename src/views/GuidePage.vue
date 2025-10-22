<template>
  <div class="guide-page">
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
      src="/audio/b1.mp3"
      loop
      @ended="handleAudioEnded"
    ></audio>

    <!-- 页面头部 -->
    <header class="guide-header">
      <h1 class="guide-title">游戏指引</h1>
      <p class="guide-subtitle">探索神秘世界，开启冒险之旅</p>
    </header>

    <!-- 主要内容区域 -->
    <main class="guide-content">
      <!-- 游戏介绍部分 -->
      <section class="guide-section">
        <h2 class="section-title">🎮 游戏介绍</h2>
        <div class="intro-content">
          <p>欢迎来到神秘冒险世界！这是一款充满探索与解谜的冒险游戏，你将扮演一名勇敢的冒险者，探索神秘的地图，解开古老的谜题，收集珍贵的宝藏。</p>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">🗺️</div>
              <h3>全景地图探索</h3>
              <p>自由探索广阔的游戏世界，发现隐藏的秘密地点</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🧩</div>
              <h3>智力解谜挑战</h3>
              <p>挑战各种难度的谜题，锻炼你的逻辑思维能力</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🏆</div>
              <h3>成就系统</h3>
              <p>完成各种任务和挑战，解锁专属成就和奖励</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 快速开始指南 -->
      <section class="guide-section">
        <h2 class="section-title">🚀 快速开始</h2>
        <div class="quick-start">
          <div class="step-card">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>创建账号</h3>
              <p>在首页输入用户名和密码创建账号，或直接登录已有账号</p>
            </div>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>探索地图</h3>
              <p>点击首页的全景地图预览框，进入地图页面开始探索</p>
            </div>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>选择地点</h3>
              <p>在地图上选择感兴趣的地点，开始你的冒险之旅</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 功能区域介绍 -->
      <section class="guide-section">
        <h2 class="section-title">🏛️ 功能区域</h2>
        <div class="location-grid">
          <div class="location-card">
            <h3>图书馆</h3>
            <p>📚 查阅游戏历史资料和背景故事</p>
            <ul>
              <li>了解游戏世界观</li>
              <li>学习解谜技巧</li>
              <li>查看任务日志</li>
            </ul>
          </div>
          <div class="location-card">
            <h3>天文台</h3>
            <p>🔭 观察星空，获取神秘提示</p>
            <ul>
              <li>星象解谜</li>
              <li>时间线索</li>
              <li>隐藏任务</li>
            </ul>
          </div>
          <div class="location-card">
            <h3>神庙</h3>
            <p>🏺 挑战古老的谜题和机关</p>
            <ul>
              <li>机关解谜</li>
              <li>符文破译</li>
              <li>祭祀仪式</li>
            </ul>
          </div>
          <div class="location-card">
            <h3>宝藏室</h3>
            <p>💎 查看收集的宝藏和成就</p>
            <ul>
              <li>宝藏展示</li>
              <li>成就统计</li>
              <li>收藏管理</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 游戏技巧 -->
      <section class="guide-section">
        <h2 class="section-title">💡 游戏技巧</h2>
        <div class="tips-content">
          <div class="tip-item">
            <h3>仔细观察</h3>
            <p>游戏中的每个细节都可能是解谜的关键，仔细观察环境变化</p>
          </div>
          <div class="tip-item">
            <h3>记录线索</h3>
            <p>遇到重要线索时及时记录，避免遗忘关键信息</p>
          </div>
          <div class="tip-item">
            <h3>尝试组合</h3>
            <p>不同的道具和线索可以组合使用，尝试多种可能性</p>
          </div>
          <div class="tip-item">
            <h3>寻求帮助</h3>
            <p>遇到困难时可以查看图书馆的资料或观察星象获取提示</p>
          </div>
        </div>
      </section>

      <!-- 导航按钮 -->
      <div class="navigation-buttons">
        <button @click="goToHome" class="nav-button home-button">返回首页</button>
        <button @click="goToMap" class="nav-button map-button">开始冒险</button>
      </div>
    </main>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'GuidePage',
  setup() {
    const router = useRouter()
    
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

    // 页面导航方法
    const goToHome = () => {
      router.push('/')
    }

    const goToMap = () => {
      router.push('/map')
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
      audioPlayer,
      isPlaying,
      volume,
      toggleAudio,
      updateVolume,
      handleAudioEnded,
      goToHome,
      goToMap
    }
  }
}
</script>

<style scoped>
/* 音频控制区域样式 */
.audio-controls {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border-radius: 15px;
  padding: 15px 25px;
  margin-bottom: 25px;
  border: 1px solid rgba(79, 195, 247, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
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
  color: #4fc3f7;
  margin: 0;
  font-weight: 600;
}

.audio-buttons {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.audio-button {
  background: linear-gradient(45deg, #29b6f6, #4fc3f7);
  color: #0a1929;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  min-width: 80px;
}

.audio-button:hover {
  background: linear-gradient(45deg, #4fc3f7, #81d4fa);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(41, 182, 246, 0.3);
}

.audio-button.playing {
  background: linear-gradient(45deg, #ff9800, #ffb74d);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-icon {
  font-size: 1.1rem;
  color: #4fc3f7;
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
  background: #4fc3f7;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4fc3f7;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.volume-value {
  font-size: 0.9rem;
  color: #b3e5fc;
  min-width: 40px;
  text-align: center;
}

.guide-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1929 0%, #1a3658 50%, #2c5282 100%);
  color: #e0f7fa;
  padding: 20px;
}

.guide-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 60px 0;
  background: linear-gradient(180deg, rgba(79, 195, 247, 0.15) 0%, transparent 100%);
  border-bottom: 1px solid rgba(79, 195, 247, 0.3);
}

.guide-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 15px;
  background: linear-gradient(45deg, #4fc3f7, #29b6f6, #0288d1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(79, 195, 247, 0.3);
}

.guide-subtitle {
  font-size: 1.3rem;
  color: #b3e5fc;
  font-weight: 300;
  letter-spacing: 1px;
}

.guide-content {
  max-width: 1200px;
  margin: 0 auto;
}

.guide-section {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 35px;
  margin-bottom: 35px;
  border: 1px solid rgba(79, 195, 247, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.guide-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.section-title {
  font-size: 2.2rem;
  margin-bottom: 25px;
  text-align: center;
  color: #4fc3f7;
  text-shadow: 0 0 20px rgba(79, 195, 247, 0.3);
  font-weight: 600;
}

/* 游戏介绍样式 */
.intro-content p {
  font-size: 1.15rem;
  line-height: 1.7;
  margin-bottom: 35px;
  text-align: center;
  color: #e1f5fe;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 35px;
}

.feature-card {
  background: linear-gradient(145deg, rgba(79, 195, 247, 0.12), rgba(38, 166, 154, 0.08));
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(79, 195, 247, 0.2);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(79, 195, 247, 0.1), transparent);
  transition: left 0.6s ease;
}

.feature-card:hover::before {
  left: 100%;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  border-color: rgba(79, 195, 247, 0.4);
}

.feature-icon {
  font-size: 3.5rem;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 10px rgba(79, 195, 247, 0.3));
}

.feature-card h3 {
  font-size: 1.4rem;
  margin-bottom: 12px;
  color: #4fc3f7;
  font-weight: 600;
}

.feature-card p {
  font-size: 1rem;
  color: #b3e5fc;
  line-height: 1.5;
}

/* 快速开始样式 */
.quick-start {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.step-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  padding: 25px;
  border-radius: 15px;
  border-left: 4px solid #29b6f6;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.step-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: #4fc3f7;
  transform: translateX(10px);
}

.step-number {
  background: linear-gradient(45deg, #29b6f6, #4fc3f7);
  color: #0a1929;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.3rem;
  margin-right: 25px;
  box-shadow: 0 4px 15px rgba(41, 182, 246, 0.3);
}

.step-content h3 {
  font-size: 1.3rem;
  margin-bottom: 8px;
  color: #4fc3f7;
  font-weight: 600;
}

.step-content p {
  color: #e1f5fe;
  line-height: 1.5;
}

/* 功能区域样式 */
.location-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.location-card {
  background: rgba(255, 255, 255, 0.06);
  padding: 30px;
  border-radius: 15px;
  border: 1px solid rgba(79, 195, 247, 0.2);
  transition: all 0.3s ease;
  position: relative;
}

.location-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
  border-color: rgba(79, 195, 247, 0.4);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.location-card h3 {
  font-size: 1.4rem;
  margin-bottom: 12px;
  color: #26a69a;
  font-weight: 600;
}

.location-card p {
  font-size: 1.1rem;
  margin-bottom: 18px;
  color: #e1f5fe;
  font-weight: 500;
}

.location-card ul {
  list-style: none;
  padding: 0;
}

.location-card li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #b3e5fc;
  transition: color 0.3s ease;
}

.location-card li:hover {
  color: #4fc3f7;
}

.location-card li:before {
  content: '🔹';
  color: #4fc3f7;
  margin-right: 12px;
  font-size: 1.1rem;
}

/* 游戏技巧样式 */
.tips-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.tip-item {
  background: rgba(255, 255, 255, 0.06);
  padding: 25px;
  border-radius: 15px;
  border-left: 4px solid #26a69a;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tip-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: #4db6ac;
  transform: translateY(-5px);
}

.tip-item h3 {
  font-size: 1.3rem;
  margin-bottom: 12px;
  color: #26a69a;
  font-weight: 600;
}

.tip-item p {
  color: #e1f5fe;
  line-height: 1.5;
}

/* 导航按钮样式 */
.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-top: 50px;
}

.nav-button {
  padding: 16px 35px;
  border: none;
  border-radius: 25px;
  font-size: 1.15rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.home-button {
  background: rgba(255, 255, 255, 0.1);
  color: #e0f7fa;
  border: 2px solid rgba(79, 195, 247, 0.4);
}

.home-button:hover {
  background: rgba(79, 195, 247, 0.2);
  color: white;
  border-color: rgba(79, 195, 247, 0.6);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(79, 195, 247, 0.3);
}

.map-button {
  background: linear-gradient(45deg, #29b6f6, #4fc3f7);
  color: #0a1929;
  border: none;
  box-shadow: 0 4px 15px rgba(41, 182, 246, 0.3);
}

.map-button:hover {
  background: linear-gradient(45deg, #4fc3f7, #81d4fa);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(41, 182, 246, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .guide-title {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .guide-section {
    padding: 25px;
    margin-bottom: 25px;
  }
  
  .feature-grid,
  .location-grid,
  .tips-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .step-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  .step-number {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .navigation-buttons {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .nav-button {
    width: 100%;
    max-width: 280px;
    padding: 14px 25px;
  }
}

@media (max-width: 480px) {
  .guide-page {
    padding: 15px;
  }
  
  .guide-header {
    padding: 40px 0;
  }
  
  .guide-title {
    font-size: 2rem;
  }
  
  .guide-subtitle {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}
</style>