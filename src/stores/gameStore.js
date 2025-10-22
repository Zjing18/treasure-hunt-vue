import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    currentUser: null,
    currentLocation: 'home',
    gameProgress: {
      clueFound: false,
      locationDecoded: false,
      templeSearched: false,
      treasureFound: false,
      booksExamined: 0,
      observatoryVisited: false  // 确保这个属性存在
    },
    collectedItems: [
      // 钥匙系统
      // { id: 'bronze-key', name: '青铜钥匙', description: '用于解锁基础区域', obtained: false, location: 'library' },
      // { id: 'silver-key', name: '银钥匙', description: '用于解锁中级区域', obtained: false, location: 'observatory' },
      // { id: 'golden-key', name: '金钥匙', description: '用于解锁宝藏室', obtained: false, location: 'temple' },
      // { id: 'ancient-key', name: '古老钥匙', description: '用于解锁祭坛室', obtained: false, location: 'temple' }
    ],
    keys: {
      'bronze-key': { 
        name: '青铜钥匙', 
        description: '在图书馆的古籍中发现的基础钥匙', 
        obtained: false,
        location: 'library',
        unlocks: ['main-hall']
      },
      'silver-key': { 
        name: '银钥匙', 
        description: '通过星象解码获得的进阶钥匙', 
        obtained: false,
        location: 'observatory', 
        unlocks: ['secret-passage']
      },
      'golden-key': { 
        name: '金钥匙', 
        description: '在神庙探索中发现的珍贵钥匙', 
        obtained: false,
        location: 'temple',
        unlocks: ['treasure-chamber']
      },
      'ancient-key': { 
        name: '古老钥匙', 
        description: '解开古老谜题后获得的钥匙', 
        obtained: false,
        location: 'temple',
        unlocks: ['altar-room']
      }
    },
    gameTime: 0,
    score: 0,
    currentClue: null
  }),
  
  actions: {
    setUser(user) {
      this.currentUser = user
    },
    
    updateProgress(progress) {
      this.gameProgress = { ...this.gameProgress, ...progress }
    },
    
    addItem(item) {
      if (!this.collectedItems.includes(item)) {
        this.collectedItems.push(item)
      }
    },
    
    // 新增：获取钥匙
    obtainKey(keyId) {
      if (this.keys[keyId]) {
        this.keys[keyId].obtained = true
        this.updateScore(50) // 获取钥匙奖励分数
        return true
      }
      return false
    },
    
    // 新增：检查是否拥有钥匙
    hasKey(keyId) {
      return this.keys[keyId]?.obtained || false
    },
    
    // 新增：获取玩家当前拥有的所有钥匙
    getObtainedKeys() {
      return Object.entries(this.keys)
        .filter(([_, key]) => key.obtained)
        .map(([id, key]) => ({ id, ...key }))
    },
    
    updateScore(points) {
      this.score += points
    },
    
    setCurrentClue(clue) {
      this.currentClue = clue
    },
    
    incrementBooksExamined() {
      this.gameProgress.booksExamined += 1
    },
    
    resetGame() {
      this.gameProgress = {
        clueFound: false,
        locationDecoded: false,
        templeSearched: false,
        treasureFound: false,
        booksExamined: 0
      }
      this.collectedItems = []
      // 重置钥匙状态
      Object.keys(this.keys).forEach(keyId => {
        this.keys[keyId].obtained = false
      })
      this.gameTime = 0
      this.score = 0
      this.currentClue = null
    },
    
    goToNextLocation() {
      const locations = ['home', 'library', 'observatory', 'temple', 'treasure']
      const currentIndex = locations.indexOf(this.currentLocation)
      if (currentIndex < locations.length - 1) {
        this.currentLocation = locations[currentIndex + 1]
      }
    }
  },
  
  getters: {
    isGameCompleted: (state) => {
      return state.gameProgress.treasureFound
    },
    
    progressPercentage: (state) => {
      const progress = state.gameProgress
      const totalSteps = Object.keys(progress).length
      const completedSteps = Object.values(progress).filter(Boolean).length
      return Math.round((completedSteps / totalSteps) * 100)
    },
    
    canGoToObservatory: (state) => {
      return state.gameProgress.clueFound
    },
    
    // 新增：获取钥匙数量
    keyCount: (state) => {
      return Object.values(state.keys).filter(key => key.obtained).length
    },
    
    // 新增：检查是否可以解锁特定房间
    canUnlockRoom: (state) => (roomId) => {
      const requiredKey = Object.entries(state.keys).find(([_, key]) => 
        key.unlocks.includes(roomId)
      )
      return !requiredKey || state.keys[requiredKey[0]]?.obtained
    }
  }
})