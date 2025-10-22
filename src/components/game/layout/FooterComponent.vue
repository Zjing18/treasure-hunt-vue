<template>
  <footer class="app-footer">
    <div class="footer-background"></div>
    <div class="footer-content">
      <div class="footer-main">
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="footer-logo-icon">🏴‍☠️</span>
            <h3 class="footer-title">寻宝游戏</h3>
          </div>
          <p class="footer-description">探索古老神庙，寻找失落的日影圣匣</p>
          <div class="footer-stats">
            <div class="stat">
              <span class="stat-number">{{ totalPlayers }}</span>
              <span class="stat-label">玩家总数</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ totalGames }}</span>
              <span class="stat-label">游戏次数</span>
            </div>
          </div>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h4>游戏导航</h4>
            <router-link to="/" class="footer-link">
              <span class="link-icon">🏠</span>
              <span>首页</span>
            </router-link>
            <router-link to="/library" class="footer-link">
              <span class="link-icon">📚</span>
              <span>图书馆</span>
            </router-link>
            <router-link to="/leaderboard" class="footer-link">
              <span class="link-icon">🏆</span>
              <span>排行榜</span>
            </router-link>
          </div>
          
          <div class="link-group">
            <h4>游戏特性</h4>
            <span class="footer-link">
              <span class="link-icon">🧩</span>
              <span>智慧解谜</span>
            </span>
            <span class="footer-link">
              <span class="link-icon">⭐</span>
              <span>星象解码</span>
            </span>
            <span class="footer-link">
              <span class="link-icon">🗺️</span>
              <span>动态地图</span>
            </span>
          </div>
          
          <div class="link-group">
            <h4>技术支持</h4>
            <span class="footer-link">
              <span class="link-icon">🚀</span>
              <span>Vue 3 开发</span>
            </span>
            <span class="footer-link">
              <span class="link-icon">🎯</span>
              <span>版本 1.0.0</span>
            </span>
            <span class="footer-link">
              <span class="link-icon">💡</span>
              <span>持续更新</span>
            </span>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <div class="footer-copyright">
          <p>&copy; 2025 Treasure Hunt Game CopyRight @Jingjing Zhang</p>
        </div>
        <div class="footer-social">
          <span class="social-text">关注我们:</span>
          <div class="social-icons">
            <span class="social-icon" @click="shareGame">📱</span>
            <span class="social-icon" @click="openTwitter">🐦</span>
            <span class="social-icon" @click="openYouTube">📺</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'FooterComponent',
  setup() {
    const totalPlayers = ref(1284)
    const totalGames = ref(3567)
    
    const shareGame = () => {
      if (navigator.share) {
        navigator.share({
          title: '寻宝游戏',
          text: '快来体验这个精彩的寻宝游戏！',
          url: window.location.href
        })
      } else {
        alert('分享功能需要现代浏览器支持')
      }
    }
    
    const openTwitter = () => {
      window.open('https://twitter.com', '_blank')
    }
    
    const openYouTube = () => {
      window.open('https://youtube.com', '_blank')
    }
    
    return {
      totalPlayers,
      totalGames,
      shareGame,
      openTwitter,
      openYouTube
    }
  }
}
</script>

<style scoped>
.app-footer {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 50%, rgba(15, 52, 96, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 213, 126, 0.3);
  margin-top: auto;
  position: relative;
  overflow: hidden;
}

.footer-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 100%, rgba(255, 213, 126, 0.05) 0%, transparent 50%);
  animation: footerGlow 4s ease-in-out infinite alternate;
}

@keyframes footerGlow {
  0% { opacity: 0.2; }
  100% { opacity: 0.6; }
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem 1.5rem;
  position: relative;
  z-index: 1;
}

.footer-main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  margin-bottom: 2rem;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-logo-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 15px rgba(255, 213, 126, 0.5));
  animation: logoSpin 4s ease-in-out infinite;
}

@keyframes logoSpin {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(5deg); }
}

.footer-title {
  font-size: 1.8rem;
  color: #ffd57e;
  margin: 0;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(255, 213, 126, 0.4);
}

.footer-description {
  color: #ccc;
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
  max-width: 300px;
}

.footer-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-number {
  color: #ffd57e;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 213, 126, 0.3);
}

.stat-label {
  color: #aaa;
  font-size: 0.8rem;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.link-group h4 {
  color: #ffd57e;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(255, 213, 126, 0.3);
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ccc;
  text-decoration: none;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  cursor: pointer;
}

.footer-link:hover {
  color: #ffd57e;
  transform: translateX(5px);
}

.link-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.footer-link:hover .link-icon {
  transform: scale(1.2);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-copyright p {
  color: #aaa;
  margin: 0;
  font-size: 0.9rem;
}

.footer-social {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.social-text {
  color: #aaa;
  font-size: 0.9rem;
}

.social-icons {
  display: flex;
  gap: 0.5rem;
}

.social-icon {
  color: #ffd57e;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 50%;
  background: rgba(255, 213, 126, 0.1);
}

.social-icon:hover {
  transform: scale(1.2);
  background: rgba(255, 213, 126, 0.2);
  box-shadow: 0 0 15px rgba(255, 213, 126, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    padding: 2rem 1.5rem 1rem;
  }
  
  .footer-main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .footer-brand {
    text-align: center;
  }
  
  .footer-stats {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-content {
    padding: 1.5rem 1rem 1rem;
  }
  
  .footer-title {
    font-size: 1.5rem;
  }
  
  .link-group h4 {
    font-size: 1rem;
  }
  
  .footer-link {
    font-size: 0.85rem;
  }
}
</style>