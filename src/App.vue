<template>
  <div id="app">
    <HeaderComponent />
    <main class="main-content">
      <router-view />
    </main>
    <FooterComponent />
    <MiniMapComponent />
  </div>
</template>

<script>
import HeaderComponent from './components/game/layout/HeaderComponent.vue'
import FooterComponent from './components/game/layout/FooterComponent.vue'
import MiniMapComponent from './components/game/MiniMapComponent.vue'

export default {
  name: 'App',                                                                                       // 1                                                                                                                                                                 
  components: {
    HeaderComponent,
    FooterComponent,
    MiniMapComponent
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
}
</style>