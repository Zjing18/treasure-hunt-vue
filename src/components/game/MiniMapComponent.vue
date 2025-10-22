<template>
  <div class="mini-map" :class="{ 'mini-map-collapsed': isCollapsed }">
    <div class="map-header" @click="toggleCollapse">
      <h4>探险地图</h4>
      <span class="collapse-icon">{{ isCollapsed ? '▶' : '▼' }}</span>
    </div>
    
    <div v-if="!isCollapsed" class="map-content">
      <div class="map-container">
        <svg viewBox="0 0 100 100" class="map-svg">
          <!-- 背景网格 -->
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(30, 58, 138, 0.3)" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          <!-- 探险路径 -->
          <path d="M15,80 L30,65 L50,45 L70,60 L85,75" 
                stroke="rgba(59, 130, 246, 0.8)" stroke-width="2" fill="none" 
                stroke-dasharray="4 2" class="exploration-path"/>
          
          <!-- 网格点 - 简洁版本 -->
          <g v-for="location in locations" :key="location.id">
            <!-- 网格点 -->
            <circle :cx="location.x" :cy="location.y" r="4" 
                    :class="['grid-point', location.status]" />
            
            <!-- 场景名称 -->
            <text :x="location.x" :y="location.y + 8" 
                  text-anchor="middle" class="location-name">
              {{ location.name }}
            </text>
            
            <!-- 点击区域 -->
            <circle :cx="location.x" :cy="location.y" r="10" 
                    class="click-area" @click="goToLocation(location.id)"
                    :title="`${location.name} - ${getStatusText(location.status)}`" />
          </g>
          
          <!-- 当前位置指示器 -->
          <circle v-if="currentLocation" 
                  :cx="currentLocation.x" 
                  :cy="currentLocation.y" 
                  r="6"
                  class="current-location-indicator"
                  :title="`当前位置: ${currentLocation.name}`" />
        </svg>
      </div>
      
      <!-- 进度条 -->
      <div class="progress-section">
        <div class="progress-label">
          <span>探险进度</span>
          <span>{{ progressPercentage }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
      
      <!-- 图例 -->
      <div class="map-legend">
        <div class="legend-item">
          <span class="legend-dot current"></span>当前位置
        </div>
        <div class="legend-item">
          <span class="legend-dot completed"></span>已完成
        </div>
        <div class="legend-item">
          <span class="legend-dot pending"></span>待探索
        </div>
        <div class="legend-item">
          <span class="legend-dot locked"></span>已锁定
        </div>
      </div>
      
      <!-- 钥匙收集状态 -->
      <div class="keys-section" v-if="obtainedKeys.length > 0">
        <h5>已收集钥匙</h5>
        <div class="keys-grid">
          <div v-for="key in obtainedKeys" :key="key.id" class="key-item">
            <span class="key-icon">🔑</span>
            <span class="key-name">{{ key.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useGameStore } from '../../stores/gameStore'
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'

export default {
  name: 'MiniMapComponent',
  setup() {
    const gameStore = useGameStore()
    const router = useRouter()
    const isCollapsed = ref(false)
    
    // 只包含实际存在的游戏关卡
    const allLocations = [
      { id: 'home', name: '起始营地', x: 15, y: 80, requiredKey: null },
      { id: 'library', name: '古籍图书馆', x: 30, y: 65, requiredKey: null },
      { id: 'observatory', name: '星象天文台', x: 50, y: 45, requiredKey: 'bronze-key' },
      { id: 'temple', name: '黑曜神庙', x: 70, y: 60, requiredKey: 'silver-key' },
      { id: 'treasure', name: '宝藏殿堂', x: 85, y: 75, requiredKey: 'golden-key' }
    ]
    
    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        'current': '当前位置',
        'completed': '已完成',
        'pending': '待探索',
        'locked': '已锁定'
      }
      return texts[status] || '未知'
    }
    
    // 计算当前位置
    const currentLocation = computed(() => {
      return allLocations.find(loc => loc.id === gameStore.currentLocation)
    })
    
    // 计算位置状态
    const getLocationStatus = (locationId) => {
      const progress = gameStore.gameProgress
      
      if (gameStore.currentLocation === locationId) return 'current'
      
      // 检查是否满足解锁条件
      const location = allLocations.find(loc => loc.id === locationId)
      if (location.requiredKey && !gameStore.hasKey(location.requiredKey)) {
        return 'locked'
      }
      
      switch(locationId) {
        case 'home': return 'completed'
        case 'library': return progress.clueFound ? 'completed' : 'pending'
        case 'observatory': return progress.locationDecoded ? 'completed' : 'pending'
        case 'temple': return progress.templeSearched ? 'completed' : 'pending'
        case 'treasure': return progress.treasureFound ? 'completed' : 'pending'
        default: return 'pending'
      }
    }
    
    // 过滤可显示的位置
    const locations = computed(() => {
      return allLocations.filter(location => {
        // 总是显示当前位置和已完成位置
        if (getLocationStatus(location.id) === 'current' || 
            getLocationStatus(location.id) === 'completed') {
          return true
        }
        
        // 显示待探索位置（如果已解锁）
        if (getLocationStatus(location.id) === 'pending') {
          return true
        }
        
        // 不显示锁定位置（除非是下一个目标）
        return false
      }).map(loc => ({
        ...loc,
        status: getLocationStatus(loc.id)
      }))
    })
    
    // 进度百分比
    const progressPercentage = computed(() => {
      return gameStore.progressPercentage
    })
    
    // 已获得的钥匙
    const obtainedKeys = computed(() => {
      return gameStore.getObtainedKeys()
    })
    
    // 导航到位置
    const goToLocation = (locationId) => {
      const status = getLocationStatus(locationId)
      if (status === 'locked') {
        alert('该区域需要特定钥匙才能解锁！')
        return
      }
      
      if (status !== 'current') {
        // 检查路由是否存在
        const routeExists = router.getRoutes().some(route => route.name === locationId)
        if (routeExists) {
          router.push({ name: locationId })
        } else {
          alert(`页面 ${locationId} 尚未开发完成！`)
        }
      }
    }
    
    // 切换折叠状态
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
    }
    
    return {
      locations,
      currentLocation,
      progressPercentage,
      obtainedKeys,
      isCollapsed,
      goToLocation,
      toggleCollapse,
      getStatusText
    }
  }
}
</script>

<style scoped>
.mini-map {
  position: fixed;
  top: 100px;
  right: 20px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
  border: 2px solid rgba(59, 130, 246, 0.6);
  border-radius: 15px;
  padding: 15px;
  z-index: 1000;
  min-width: 280px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.7),
    0 0 20px rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.mini-map:hover {
  border-color: rgba(96, 165, 250, 0.9);
  box-shadow: 
    0 15px 40px rgba(0, 0, 0, 0.9),
    0 0 30px rgba(59, 130, 246, 0.5);
}

.mini-map-collapsed {
  width: 150px;
  padding: 10px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
}

.map-header h4 {
  margin: 0;
  color: #93c5fd;
  font-size: 1.1rem;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(147, 197, 253, 0.5);
}

.collapse-icon {
  color: #93c5fd;
  font-size: 0.9rem;
}

.map-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.map-svg {
  width: 100%;
  height: 200px;
  margin-bottom: 15px;
}

.exploration-path {
  animation: pathGlow 3s ease-in-out infinite;
}

@keyframes pathGlow {
  0%, 100% { stroke-opacity: 0.6; }
  50% { stroke-opacity: 0.9; }
}

/* 网格点样式 */
.grid-point {
  transition: all 0.3s ease;
}

.grid-point.current {
  fill: #10b981;
  r: 6;
  filter: drop-shadow(0 0 8px #10b981);
}

.grid-point.completed {
  fill: #3b82f6;
  r: 4;
}

.grid-point.pending {
  fill: #f59e0b;
  r: 4;
}

.grid-point.locked {
  fill: #6b7280;
  r: 4;
  cursor: not-allowed;
}

.location-name {
  font-size: 6px;
  fill: #e2e8f0;
  pointer-events: none;
  font-weight: 500;
}

.click-area {
  fill: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.click-area:hover {
  fill: rgba(59, 130, 246, 0.1);
}

.current-location-indicator {
  fill: none;
  stroke: #10b981;
  stroke-width: 2;
  stroke-dasharray: 4;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { 
    stroke-width: 2;
    stroke-opacity: 1;
  }
  50% { 
    stroke-width: 3;
    stroke-opacity: 0.7;
  }
}

.progress-section {
  margin-bottom: 15px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.8rem;
  color: #93c5fd;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.map-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  color: #cbd5e1;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.legend-dot.current {
  background: #10b981;
}

.legend-dot.completed {
  background: #3b82f6;
}

.legend-dot.pending {
  background: #f59e0b;
}

.legend-dot.locked {
  background: #6b7280;
}

.keys-section h5 {
  margin: 0 0 8px 0;
  color: #93c5fd;
  font-size: 0.8rem;
}

.keys-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.key-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #cbd5e1;
}

.key-icon {
  margin-right: 4px;
  font-size: 0.9rem;
}

.key-name {
  font-size: 0.65rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mini-map {
    right: 10px;
    min-width: 250px;
  }
  
  .map-legend,
  .keys-grid {
    grid-template-columns: 1fr;
  }
}
</style>