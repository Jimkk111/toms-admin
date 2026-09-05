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

// 品牌主色：苍穹外卖黄
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#ffc200',
    primaryColorHover: '#ffd15c',
    primaryColorPressed: '#e6ae00',
    primaryColorSuppl: '#ffc200',
  },
}
</script>
