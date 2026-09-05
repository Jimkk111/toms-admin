<template>
  <div class="not-found">
    <n-result
      status="404"
      title="404"
      description="页面不存在，请检查地址是否正确"
    >
      <template #footer>
        <n-button
          type="primary"
          @click="router.push('/')"
        >
          返回首页
        </n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style lang="scss" scoped>
.not-found {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
