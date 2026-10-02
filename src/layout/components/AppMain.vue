<template>
  <section class="app-main">
    <!-- 作用域插槽 -->
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppMain' })
</script>

<style lang="scss" scoped>
.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 15px 20px 20px;
}
</style>
