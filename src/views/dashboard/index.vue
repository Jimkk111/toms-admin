<template>
  <div class="dashboard">
    <HeadLable title="工作台" />
    <n-card
      class="placeholder"
      :bordered="false"
    >
      工作台内容将在后续阶段迁移（今日数据、菜品/套餐/订单总览）。
    </n-card>
  </div>
</template>

<script setup lang="ts">
import HeadLable from '@/components/HeadLable/index.vue'

defineOptions({ name: 'Dashboard' })
</script>

<style lang="scss" scoped>
.placeholder {
  border-radius: 4px;
}
</style>
