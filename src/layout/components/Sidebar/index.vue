<template>
  <div
    class="sidebar"
    :class="{ collapsed }"
  >
    <div class="logo">
      <img
        v-if="!collapsed"
        class="logo-full"
        src="@/assets/login/icon_logo.png"
        alt="苍穹外卖"
      />
      <img
        v-else
        class="logo-mini"
        src="@/assets/login/mini-logo.png"
        alt="苍穹外卖"
      />
    </div>
    <n-scrollbar class="menu-scroll">
      <n-menu
        :value="activeKey"
        :options="menuOptions"
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="20"
        :indent="24"
        :inverted="true"
        @update:value="handleSelect"
      />
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const collapsed = computed(() => !appStore.sidebarOpened)
const activeKey = computed(() => route.path)

const menuOptions: MenuOption[] = (
  router.options.routes.find((r) => r.path === '/')?.children ?? []
)
  .filter((r) => !r.meta?.hidden)
  .map((r) => {
    const icon = r.meta?.icon
    return {
      key: `/${r.path}`.replace(/\/+/g, '/'),
      label: r.meta?.title ?? '',
      icon: icon ? () => h('i', { class: ['iconfont', icon] }) : undefined,
    }
  })

const handleSelect = (key: string) => {
  router.push(key).catch(() => {})
}
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 190px;
  background-color: #343744;
  overflow: hidden;

  &.collapsed {
    width: 64px;
  }

  .logo {
    flex-shrink: 0;
    text-align: center;
    background-color: #ffc100;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;

    /* 两个状态各自固定尺寸，不做缩放动画 */
    .logo-full {
      width: 110px;
    }

    .logo-mini {
      width: 32px;
    }
  }

  .menu-scroll {
    flex: 1;
    min-height: 0;
  }

  :deep(.n-menu) {
    padding: 20px 0;
  }

  :deep(.n-menu.inverted .n-menu-item-content--selected) {
    color: #ffc200;

    .iconfont {
      color: #ffc200;
    }
  }
}
</style>
