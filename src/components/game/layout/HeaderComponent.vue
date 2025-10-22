<template>
  <header class="app-header">
    <div class="header-background"></div>
    <div class="header-content">
      <router-link to="/" class="logo">
        <div class="logo-icon">🏴‍☠️</div>
        <h1>寻宝游戏</h1>
      </router-link>
      
      <nav class="navigation">
        <router-link to="/" class="nav-link">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">首页</span>
        </router-link>
        <router-link to="/leaderboard" class="nav-link">
          <span class="nav-icon">🏆</span>
          <span class="nav-text">排行榜</span>
        </router-link>
        <router-link v-if="userStore.isLoggedIn" to="/profile" class="nav-link">
          <span class="nav-icon">👤</span>
          <span class="nav-text">个人资料</span>
        </router-link>
      </nav>
      
      <div class="user-section">
        <div v-if="userStore.isLoggedIn" class="user-info">
          <div class="user-avatar">👋</div>
          <div class="user-details">
            <span class="username">{{ userStore.currentUser.username }}</span>
            <span class="user-score">⭐ {{ userStore.currentUser.highScore || 0 }}</span>
          </div>
          <button class="btn-logout" @click="logout">
            <span class="logout-icon">🚪</span>
            <span class="logout-text">退出</span>
          </button>
        </div>
        <div v-else class="auth-buttons">
          <router-link to="/" class="btn-login">
            <span class="login-icon">🔑</span>
            <span class="login-text">请先登录</span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { useUserStore } from '../../../stores/userStore'
import { useRouter } from 'vue-router'

export default {
  name: 'HeaderComponent',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    
    const logout = () => {
      userStore.logoutUser()
      router.push('/')
    }
    
    return {
      userStore,
      logout
    }
  }
}
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 50%, rgba(15, 52, 96, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 213, 126, 0.4);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255, 213, 126, 0.1) 0%, transparent 50%);
  animation: headerGlow 3s ease-in-out infinite alternate;
}

@keyframes headerGlow {
  0% { opacity: 0.3; }
  100% { opacity: 0.7; }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 10px rgba(255, 213, 126, 0.5));
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.logo h1 {
  color: #ffd57e;
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(255, 213, 126, 0.6);
  margin: 0;
  background: linear-gradient(45deg, #ffd57e, #ffb347, #ff8c42);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.navigation {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ccc;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 213, 126, 0.2), transparent);
  transition: left 0.5s ease;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover, .nav-link.router-link-active {
  color: #ffd57e;
  background: rgba(255, 213, 126, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 213, 126, 0.2);
}

.nav-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.nav-link:hover .nav-icon {
  transform: scale(1.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 213, 126, 0.2);
}

.user-avatar {
  font-size: 1.5rem;
  animation: userPulse 2s ease-in-out infinite;
}

@keyframes userPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.username {
  color: #ffd57e;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-score {
  color: #4ecdc4;
  font-weight: 500;
  font-size: 0.8rem;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #ff4757, #ff6b81);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 71, 87, 0.4);
}

.btn-login {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffd57e;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border: 1px solid #ffd57e;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 213, 126, 0.1);
}

.btn-login:hover {
  background: rgba(255, 213, 126, 0.2);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .navigation {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .user-info {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>