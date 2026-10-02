<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-notification-provider>
      <n-dialog-provider>
        <n-message-provider>
          <router-view />
        </n-message-provider>
      </n-dialog-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui'

// 品牌主色：主题黄
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#289ADD',
    primaryColorHover: '#4FACE6',
    primaryColorPressed: '#1C7FBE',
    primaryColorSuppl: '#289ADD',
  },
}
</script>
