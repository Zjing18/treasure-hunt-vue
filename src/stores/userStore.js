import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: JSON.parse(localStorage.getItem('treasureUsers') || '[]'),
    currentUser: null
  }),
  
  actions: {
    registerUser(username, password) {
      // 检查用户名是否已存在
      const existingUser = this.users.find(u => u.username === username)
      if (existingUser) {
        return null // 用户名已存在
      }
      
      const newUser = {
        id: Date.now().toString(),
        username,
        password, // 存储密码
        email: `${username}@game.com`,
        createdAt: new Date().toISOString(),
        gamesPlayed: 0,
        bestTime: null,
        highScore: 0,
        lastLogin: new Date().toISOString(),
        lastVisited: null
      }
      
      this.users.push(newUser)
      this.currentUser = newUser
      this.saveToStorage()
      return newUser
    },
    
    loginUser(username, password) {
      const user = this.users.find(u => u.username === username)
      if (user) {
        // 检查密码
        if (user.password === password) {
          user.lastLogin = new Date().toISOString()
          this.currentUser = user
          this.saveToStorage()
          return user
        }
      }
      return null // 用户名或密码错误
    },
    
    logoutUser() {
      this.currentUser = null
    },
    
    updateUserStats(gameTime, score) {
      if (!this.currentUser) return
      
      this.currentUser.gamesPlayed = (this.currentUser.gamesPlayed || 0) + 1
      
      if (!this.currentUser.bestTime || gameTime < this.currentUser.bestTime) {
        this.currentUser.bestTime = gameTime
      }
      
      if (score > (this.currentUser.highScore || 0)) {
        this.currentUser.highScore = score
      }
      
      this.saveToStorage()
    },
    
    updateLastVisited(locationId) {
      if (!this.currentUser) return
      
      this.currentUser.lastVisited = locationId
      this.saveToStorage()
    },
    
    saveToStorage() {
      localStorage.setItem('treasureUsers', JSON.stringify(this.users))
    }
  },
  
  getters: {
    leaderboard: (state) => {
      return [...state.users]
        .sort((a, b) => (b.highScore || 0) - (a.highScore || 0) || (a.bestTime || Infinity) - (b.bestTime || Infinity))
        .slice(0, 10)
    },
    
    isLoggedIn: (state) => state.currentUser !== null,
    
    currentUserRank: (state) => {
      if (!state.currentUser) return null
      const sorted = [...state.users].sort((a, b) => (b.highScore || 0) - (a.highScore || 0))
      return sorted.findIndex(user => user.id === state.currentUser.id) + 1
    }
  }
})