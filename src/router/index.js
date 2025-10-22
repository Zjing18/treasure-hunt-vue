import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LibraryPage from '../views/LibraryPage.vue'
import ObservatoryPage from '../views/ObservatoryPage.vue'
import TemplePage from '../views/TemplePage.vue'
import TreasurePage from '../views/TreasurePage.vue'
import UserProfile from '../views/UserProfile.vue'
import Leaderboard from '../views/Leaderboard.vue'
import MapPage from '../views/MapPage.vue'
import GuidePage from '../views/GuidePage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/library', name: 'library', component: LibraryPage },
  { path: '/observatory', name: 'observatory', component: ObservatoryPage },
  { path: '/temple', name: 'temple', component: TemplePage },
  { path: '/treasure', name: 'treasure', component: TreasurePage },
  { path: '/profile', name: 'profile', component: UserProfile },
  { path: '/leaderboard', name: 'leaderboard', component: Leaderboard },
  { path: '/map', name: 'map', component: MapPage },
  { path: '/guide', name: 'guide', component: GuidePage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router