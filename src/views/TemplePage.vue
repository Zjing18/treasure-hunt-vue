<template>
  <div class="temple-page">
    <div class="page-header">
      <h2>🏛️ 黑曜神庙</h2>
      <p>根据星象解码的线索，探索这座古老神庙，寻找传说中的日影圣匣</p>
      <div class="temple-progress">
        <span>探索进度：{{ exploredRoomsCount }}/{{ templeRooms.length }} 个房间</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: explorationProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 钥匙提示放在最上面 -->
    <div class="keys-section">
      <h3>🔑 已获得的钥匙</h3>
      <div class="keys-container">
        <div v-for="key in obtainedKeys" :key="key.id" class="key-item">
          <div class="key-emoji">🔑</div>
          <div class="key-info">
            <div class="key-name">{{ key.name }}</div>
            <div class="key-description">{{ key.description }}</div>
          </div>
        </div>
        <div v-if="obtainedKeys.length === 0" class="no-keys">
          <p>尚未获得任何钥匙</p>
        </div>
      </div>
    </div>

    <div class="temple-content">
      <!-- 左侧：神庙布局区域 -->
      <div class="temple-layout-section">
        <h3>神庙布局</h3>
        <div class="temple-layout">
          <div class="temple-room" 
v-for="room in templeRooms" 
               :key="room.id"
               :class="{ 
                 explored: room.explored, 
                 current: currentRoom === room.id,
                 locked: room.locked && !room.explored
               }"
               @click="selectRoom(room)">
            <div class="room-icon">{{ room.emoji }}</div>
            <div class="room-name">{{ room.name }}</div>
            <div class="room-description">{{ room.description }}</div>
            <div v-if="room.explored" class="room-status explored">已探索</div>
            <div v-else-if="room.locked" class="room-status locked">需要钥匙</div>
            <div v-else class="room-status available">可探索</div>
          </div>
        </div>
      </div>

      <!-- 右侧：探索控制区域 -->
      <div class="exploration-section">
        <!-- 房间选择提示 - 与神庙布局齐平 -->
        <div v-if="currentRoom" class="current-room-info">
          <h4>当前选择：{{ currentRoomName }}</h4>
          <p>{{ currentRoomDescription }}</p>
        </div>
        <div v-else class="room-selection-prompt">
          <h4>🔍 请先选择一个房间开始探索</h4>
          <p>点击左侧神庙布局中的房间图标来选择要探索的房间</p>
        </div>

        <!-- 探索策略选择 -->
        <div class="strategy-selector">
          <h4>选择探索策略</h4>
<div class="strategy-options">
            <div v-for="strategy in strategies" 
                 :key="strategy.id"
                 class="strategy-option"
                 :class="{ 
                   active: currentStrategy === strategy.id,
                   disabled: !currentRoom 
                 }"
                 @click="selectStrategy(strategy)">
              <div class="strategy-emoji">{{ strategy.emoji }}</div>
              <div class="strategy-info">
                <div class="strategy-name">{{ strategy.name }}</div>
                <div class="strategy-desc">{{ strategy.description }}</div>
                <div class="strategy-stats">
                  <span>成功率：{{ strategy.successRate * 100 }}%</span>
                  <span>风险：{{ strategy.riskLevel }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 探索行动 -->
        <div class="exploration-controls">
          <button class="btn btn-primary" 
                  @click="startExploration" 
                  :disabled="!canExplore || exploring"
                  :class="{ disabled: !canExplore }">
            {{ exploring ? '探索中...' : '开始探索' }}
          </button>
          
          <div class="exploration-requirements">
            <p v-if="!currentRoom">🔍 请先选择一个房间</p>
            <p v-else-if="currentRoom.locked && !currentRoom.explored">🔒 这个房间需要特殊钥匙才能进入</p>
            <p v-else-if="currentRoom.explored">✅ 这个房间已经探索过了</p>
            <p v-else>🎯 准备探索 {{ currentRoomName }}</p>
          </div>
        </div>

<!-- 探索过程动画 -->
        <div v-if="exploring" class="exploration-progress">
          <div class="progress-animation">
            <div class="explorer" :style="explorerStyle">🧭</div>
            <div class="exploration-path"></div>
          </div>
          <div class="exploration-message">
            <p>{{ explorationMessages[currentExplorationMessage] }}</p>
            <div class="message-progress">
              <span>进度：{{ currentExplorationMessage + 1 }}/{{ explorationMessages.length }}</span>
            </div>
          </div>
</div>

        <!-- 探索结果 -->
        <div v-if="explorationResult" class="exploration-result" :class="explorationResult.type">
          <div class="result-header">
            <h3>{{ explorationResult.emoji }} {{ explorationResult.title }}</h3>
          </div>
          <div class="result-content">
            <p>{{ explorationResult.message }}</p>
            <div v-if="explorationResult.foundItem" class="found-item">
              <span class="item-emoji">{{ explorationResult.foundItem.emoji }}</span>
              <span class="item-name">{{ explorationResult.foundItem.name }}</span>
            </div>
          </div>
          <div class="result-actions">
            <button v-if="explorationResult.type === 'success'" 
                    class="btn btn-success" 
                    @click="continueExploration">
              {{ explorationResult.foundItem ? '收集物品' : '继续探索' }}
            </button>
            <button v-else class="btn btn-warning" @click="retryExploration">
              重新尝试
            </button>
          </div>
        </div>

        <!-- 宝藏发现 -->
        <div v-if="treasureFound" class="treasure-result">
          <div class="treasure-header">
            <h3>🏆 发现日影圣匣！</h3>
            <div class="treasure-glow">✨</div>
          </div>
          <div class="treasure-content">
            <p class="treasure-description">{{ treasureDescription }}</p>
            <div class="treasure-rewards">
              <div class="reward-item">
                <span class="reward-emoji">⭐</span>
                <span class="reward-text">获得 500 点探索分数</span>
              </div>
              <div class="reward-item">
                <span class="reward-emoji">🔑</span>
                <span class="reward-text">解锁所有神庙房间</span>
              </div>
            </div>
          </div>
          <div class="treasure-actions">
            <button class="btn btn-gold" @click="claimTreasure">
              🎉 查看宝藏和成就
            </button>
            <button class="btn btn-secondary" @click="continueExploring">
              🔍 继续探索神庙
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useRouter } from 'vue-router'

export default {
  name: 'TemplePage',
  setup() {
    const gameStore = useGameStore()
    const router = useRouter()
    
    const exploring = ref(false)
    const treasureFound = ref(false)
    const currentRoom = ref(null)
    const currentStrategy = ref('stealth')
    const currentExplorationMessage = ref(0)
    const explorationResult = ref(null)
    const keyObtained = ref(false)
    const obtainedKey = ref(null)

    const templeRooms = reactive([
      { 
        id: 'main-hall', 
        name: '主殿', 
        emoji: '🏛️', 
        description: '神庙的入口大厅，布满古老壁画',
        explored: false,
        locked: false,  // 确保主殿没有被锁定
        requiresKey: null
      },
      { 
        id: 'altar-room', 
        name: '祭坛室', 
        emoji: '🔥', 
        description: '供奉神明的祭坛，可能有隐藏机关',
        explored: false,
        locked: !gameStore.hasKey('ancient-key'),
        requiresKey: 'ancient-key'
      },
      { 
        id: 'secret-passage', 
        name: '密道', 
        emoji: '🚪', 
        description: '连接各个房间的秘密通道',
        explored: false,
        locked: !gameStore.hasKey('silver-key'),
        requiresKey: 'silver-key'
      },
      { 
        id: 'treasure-chamber', 
        name: '宝藏室', 
        emoji: '💎', 
        description: '传说中存放日影圣匣的地方',
        explored: false,
        locked: !gameStore.hasKey('golden-key'),
        requiresKey: 'golden-key'
      }
    ])
    
    const strategies = [
      { 
        id: 'stealth', 
        name: '潜行', 
        emoji: '👣', 
        description: '悄悄行动，避免触发陷阱',
        successRate: 0.7,
        riskLevel: '低'
      },
      { 
        id: 'diplomacy', 
        name: '交涉', 
        emoji: '🤝', 
        description: '与神庙守护者沟通',
        successRate: 0.8,
        riskLevel: '中'
      },
      { 
        id: 'force', 
        name: '强攻', 
        emoji: '⚔️', 
        description: '强行突破障碍',
        successRate: 0.4,
        riskLevel: '高'
      }
    ]
    
    const explorationMessages = [
      '悄悄进入房间...',
      '检查墙壁上的古老铭文...',
      '寻找隐藏的机关和陷阱...',
      '解读房间内的神秘符号...',
      '搜索可能的藏宝地点...'
    ]
    
    const foundItems = [
      { emoji: '🗝️', name: '古老钥匙', type: 'key' },
      { emoji: '📜', name: '神庙地图', type: 'map' },
      { emoji: '💎', name: '黑曜石碎片', type: 'artifact' },
      { emoji: '🔮', name: '预言水晶', type: 'artifact' }
    ]
    
    const treasureDescription = ref('')
    
    // 计算属性
    const exploredRoomsCount = computed(() => {
      return templeRooms.filter(room => room.explored).length
    })
    
    const explorationProgress = computed(() => {
      return (exploredRoomsCount.value / templeRooms.length) * 100
    })
    
    const currentRoomName = computed(() => {
      const room = templeRooms.find(r => r.id === currentRoom.value)
      return room ? room.name : ''
    })
    
    const currentRoomDescription = computed(() => {
      const room = templeRooms.find(r => r.id === currentRoom.value)
      return room ? room.description : ''
    })
    
    const canExplore = computed(() => {
      if (!currentRoom.value) return false
      const room = templeRooms.find(r => r.id === currentRoom.value)
      return room && !room.explored && !room.locked
    })
    
    const explorerStyle = computed(() => {
      const progress = (currentExplorationMessage.value / explorationMessages.length) * 100
      return { left: progress + '%' }
    })
    
    // 新增：已获得钥匙的计算属性
    const obtainedKeys = computed(() => {
      return gameStore.getObtainedKeys()
    })

    // 方法
    const selectRoom = (room) => {
      console.log('选择房间：', room.id)
      // 实时检查房间锁定状态
      room.locked = room.requiresKey ? !gameStore.hasKey(room.requiresKey) : false
      
      if (room.locked && !room.explored) {
        const requiredKey = gameStore.keys[room.requiresKey]
        explorationResult.value = {
          type: 'warning',
          title: '房间被锁',
          message: `这个房间需要${requiredKey?.name || '特殊钥匙'}才能进入`,
          emoji: '🔒'
        }
        return
      }
      currentRoom.value = room.id
      explorationResult.value = null
      console.log('房间选择成功：', room.id)
    }
    
    const selectStrategy = (strategy) => {
      if (!currentRoom.value) {
        console.log('无法选择策略：没有选择房间')
        return
      }
      console.log('选择策略：', strategy.id)
      currentStrategy.value = strategy.id
    }
    
    const startExploration = async () => {
      if (!canExplore.value) {
        console.log('无法探索：canExplore =', canExplore.value)
        return
      }
      
      console.log('开始探索房间：', currentRoom.value)
      exploring.value = true
      currentExplorationMessage.value = 0
      explorationResult.value = null
      
      for (let i = 0; i < explorationMessages.length; i++) {
        currentExplorationMessage.value = i
        await new Promise(resolve => setTimeout(resolve, 1200))
      }
      
      exploring.value = false
      
      const strategy = strategies.find(s => s.id === currentStrategy.value)
      const success = Math.random() < strategy.successRate
      
      if (success) {
        const room = templeRooms.find(r => r.id === currentRoom.value)
        if (room) room.explored = true
        
        const foundItem = Math.random() < 0.3 ? foundItems[Math.floor(Math.random() * foundItems.length)] : null
        const isTreasureRoom = currentRoom.value === 'treasure-chamber'
        
        console.log('探索成功，房间类型：', isTreasureRoom ? '宝藏室' : '普通房间')
        
        // 修复钥匙获取逻辑
        if (currentRoom.value === 'main-hall' && !gameStore.hasKey('ancient-key')) {
          console.log('在主殿发现古老钥匙')
          gameStore.obtainKey('ancient-key')
          keyObtained.value = true
          obtainedKey.value = {
            id: 'ancient-key',
            name: '古老钥匙',
            description: '在主殿的壁画后面发现的古老钥匙'
          }
        } else if (currentRoom.value === 'secret-passage' && !gameStore.hasKey('golden-key')) {
          console.log('在密道发现金钥匙')
          gameStore.obtainKey('golden-key')
          keyObtained.value = true
          obtainedKey.value = {
            id: 'golden-key',
            name: '金钥匙',
            description: '在密道的暗格中发现的珍贵钥匙'
          }
        }
        
        if (isTreasureRoom) {
          console.log('发现宝藏！')
          treasureFound.value = true
          treasureDescription.value = '在祭坛下的碎裂地砖中找到一只黑曜石箱子，里面正是传说中的日影圣匣！'
          // 立即更新游戏进度，确保宝藏被发现的状态被记录
          gameStore.updateProgress({ treasureFound: true })
        }
        
        explorationResult.value = {
          type: 'success',
          title: '探索成功！',
          message: isTreasureRoom ? '发现了传说中的日影圣匣！' : '成功探索了这个房间。',
          emoji: isTreasureRoom ? '🏆' : '✅',
          foundItem: foundItem
        }
        
        gameStore.updateScore(isTreasureRoom ? 500 : 100)
        
      } else {
        console.log('探索失败')
        explorationResult.value = {
          type: 'failure',
          title: '探索失败',
          message: '触发了古老陷阱，需要重新尝试。',
          emoji: '💥'
        }
      }
    }
    
    const continueExploration = () => {
      console.log('继续探索按钮被点击')
      explorationResult.value = null
      currentRoom.value = null
    }
    
    const retryExploration = () => {
      console.log('重新尝试按钮被点击')
      explorationResult.value = null
    }
    
    const continueExploring = () => {
      console.log('继续探索神庙按钮被点击')
      treasureFound.value = false
      explorationResult.value = null
      currentRoom.value = null
    }
    
    const claimTreasure = () => {
      console.log('前往宝藏页面按钮被点击')
      console.log('当前路由对象：', router)
      
      // 确保游戏状态正确更新
      gameStore.updateProgress({ 
        templeExplored: true, 
        treasureFound: true,
        templeSearched: true 
      })
      
      // 添加额外的分数奖励
      gameStore.updateScore(500)
      
      // 添加延迟，让用户看到成功消息
      setTimeout(() => {
        console.log('准备跳转到宝藏页面')
        try {
          // 使用router.push并添加错误处理
          router.push('/treasure').then(() => {
            console.log('路由跳转成功')
          }).catch(error => {
            console.error('路由跳转失败：', error)
            // 如果路由跳转失败，尝试使用window.location
            window.location.href = '/treasure'
          })
        } catch (error) {
          console.error('路由跳转异常：', error)
          // 备用方案：使用window.location
          window.location.href = '/treasure'
        }
      }, 1000)
    }
    
    return {
      exploring,
      treasureFound,
      currentRoom,
      currentStrategy,
      currentExplorationMessage,
      explorationResult,
      templeRooms,
      strategies,
      explorationMessages,
      treasureDescription,
      exploredRoomsCount,
      explorationProgress,
      currentRoomName,
      currentRoomDescription,
      canExplore,
      explorerStyle,
      selectRoom,
      selectStrategy,
      startExploration,
      continueExploration, // 修复：添加这个方法
      retryExploration,
      claimTreasure,
      continueExploring,
      keyObtained,
      obtainedKey,
      obtainedKeys
    }
  }
}
</script>

<style scoped>
/* 整体页面布局优化 */
.temple-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e6e6e6;
  padding: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 页面头部优化 */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  border: 1px solid rgba(255, 213, 126, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.page-header h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #ffd57e;
  text-shadow: 0 0 10px rgba(255, 213, 126, 0.5);
}

.page-header p {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}
.temple-progress {
  max-width: 400px;
  margin: 0 auto;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd57e 0%, #ffb347 100%);
  border-radius: 6px;
  transition: width 0.5s ease;
}

/* 钥匙提示放在最上面 */
.keys-section {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 213, 126, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.keys-section h3 {
  color: #ffd57e;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.keys-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.key-item {
  display: flex;
  align-items: center;
  background: rgba(255, 213, 126, 0.1);
  border: 1px solid rgba(255, 213, 126, 0.3);
  border-radius: 10px;
  padding: 1rem;
  gap: 1rem;
  transition: all 0.3s ease;
}

.key-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 213, 126, 0.2);
}

.key-emoji {
  font-size: 2rem;
}

.key-info {
  flex: 1;
}

.key-name {
  color: #ffd57e;
  font-weight: 600;
  margin-bottom: 0.3rem;
  font-size: 1.1rem;
}

.key-description {
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.4;
}

.no-keys {
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 2rem;
  grid-column: 1 / -1;
}

/* 主要内容区域布局优化 */
.temple-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  align-items: start;
}

/* 左侧：神庙布局区域 */
.temple-layout-section {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 213, 126, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  height: fit-content;
}

.temple-layout-section h3 {
  color: #ffd57e;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.temple-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.temple-room {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.temple-room::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 213, 126, 0.1), transparent);
  transition: left 0.5s ease;
}

.temple-room:hover::before {
  left: 100%;
}

.temple-room:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 213, 126, 0.5);
}

.temple-room.current {
  border-color: #ffd57e;
  box-shadow: 0 0 20px rgba(255, 213, 126, 0.3);
}

.temple-room.explored {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.5);
}

.temple-room.locked {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.5);
  cursor: not-allowed;
  opacity: 0.6;
}

.room-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.room-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #ffd57e;
}

.room-description {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  opacity: 0.8;
  line-height: 1.4;
}

.room-status {
  font-size: 0.8rem;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-weight: 600;
}

.room-status.explored {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.room-status.locked {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.room-status.available {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

/* 右侧：探索控制区域 */
.exploration-section {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 213, 126, 0.3);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  height: fit-content;
}

/* 房间选择提示 - 与神庙布局齐平 */
.current-room-info, .room-selection-prompt {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 2px solid rgba(255, 213, 126, 0.2);
}

.current-room-info h4 {
  color: #ffd57e;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}
.room-selection-prompt h4 {
  color: #ffd57e;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.room-selection-prompt p {
  color: #ccc;
  font-size: 1rem;
  opacity: 0.8;
}

/* 策略选择器优化 */
.strategy-selector {
  margin-bottom: 2rem;
}

.strategy-selector h4 {
  color: #ffd57e;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.strategy-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.strategy-option {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.strategy-option:hover:not(.disabled) {
  transform: translateY(-2px);
  border-color: rgba(255, 213, 126, 0.3);
}

.strategy-option.active {
  border-color: #ffd57e;
  background: rgba(255, 213, 126, 0.1);
}

.strategy-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.strategy-emoji {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.strategy-name {
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #ffd57e;
}

.strategy-desc {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

.strategy-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  opacity: 0.7;
}

/* 探索控制按钮优化 */
.exploration-controls {
  text-align: center;
  margin-bottom: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #ffd57e 0%, #ffb347 100%);
  color: #1a1a2e;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 213, 126, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
}

.btn-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  color: #1a1a2e;
  font-weight: 700;
}

/* 探索过程动画优化 */
.exploration-progress {
  margin: 2rem 0;
  text-align: center;
}

.progress-animation {
  position: relative;
  height: 60px;
  margin-bottom: 1rem;
}

.exploration-path {
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 3px;
  background: rgba(255, 213, 126, 0.3);
  border-radius: 2px;
}

.explorer {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  transition: left 1.2s ease;
}

.exploration-message {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.message-progress {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* 探索结果优化 */
.exploration-result {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
  border: 2px solid transparent;
}

.exploration-result.success {
  border-color: rgba(76, 175, 80, 0.5);
  background: rgba(76, 175, 80, 0.1);
}

.exploration-result.failure {
  border-color: rgba(244, 67, 54, 0.5);
  background: rgba(244, 67, 54, 0.1);
}

.exploration-result.warning {
  border-color: rgba(255, 193, 7, 0.5);
  background: rgba(255, 193, 7, 0.1);
}

.result-header h3 {
  color: #ffd57e;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}

.found-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.item-emoji {
  font-size: 1.5rem;
}

.item-name {
  font-weight: 600;
  color: #ffd57e;
}

/* 宝藏发现区域样式 */
.treasure-result {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.2) 100%);
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 15px;
  padding: 2rem;
  margin-top: 2rem;
  text-align: center;
  animation: glow 2s infinite alternate;
}

.treasure-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.treasure-header h3 {
  color: #ffd700;
  font-size: 2rem;
  margin: 0;
}

.treasure-glow {
  font-size: 2rem;
  animation: spin 3s linear infinite;
}

.treasure-content {
  margin-bottom: 2rem;
}

.treasure-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.treasure-rewards {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reward-emoji {
  font-size: 1.5rem;
}

.reward-text {
  font-weight: 600;
}

.treasure-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  color: #000;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-gold:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.btn-gold:active {
  transform: translateY(0);
}

@keyframes sparkle {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

.treasure-description {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.treasure-rewards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 2rem 0;
  position: relative;
  z-index: 1;
}

.reward-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 10px;
}

.reward-emoji {
  font-size: 1.5rem;
}

.reward-text {
  font-weight: 600;
  color: #ffd57e;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .temple-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .temple-layout {
    grid-template-columns: 1fr;
  }
  
  .strategy-options {
    grid-template-columns: 1fr;
  }
  
  .treasure-rewards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .temple-page {
    padding: 0.5rem;
  }
  
  .page-header {
    padding: 1.5rem;
  }
  
  .page-header h2 {
    font-size: 2rem;
  }
  
  .keys-section {
    padding: 1rem;
  }
  
  .keys-container {
    grid-template-columns: 1fr;
  }
  
  .temple-content {
    gap: 1rem;
  }
  
  .temple-layout-section,
  .exploration-section {
    padding: 1rem;
  }
  
  .temple-room {
    padding: 1rem;
  }
  
  .room-icon {
    font-size: 2.5rem;
  }
}

/* 加载动画 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.loading {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>