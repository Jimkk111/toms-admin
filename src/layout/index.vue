<template>
  <div class="app-wrapper">
    <!-- 顶栏全宽固定，不随侧边栏收起而移动 -->
    <Navbar class="navbar-container" />
    <div class="body-container">
      <Sidebar class="sidebar-container" />
      <AppMain class="main-container" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar/index.vue'
import Navbar from './components/Navbar/index.vue'
import AppMain from './components/AppMain.vue'
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  min-width: 1366px;
  overflow: hidden;
  background: #f3f4f7;
}

.navbar-container {
  flex-shrink: 0;
}

.body-container {
  flex: 1;
  display: flex;
  min-height: 0;
}

.sidebar-container {
  flex-shrink: 0;
  transition: width 0.28s;
}

.main-container {
  flex: 1;
  min-width: 0;
}
</style>
