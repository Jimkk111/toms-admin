<template>
  <div class="tab-change">
    <div
      v-for="item in tabList"
      :key="item.value"
      class="tab-item"
      :class="{ active: item.value === activeTab }"
      @click="tabChange(item.value)"
    >
      <n-badge
        :value="item.num && item.num > 99 ? '99+' : item.num"
        :show="[2, 3, 4].includes(item.value) && !!item.num"
      >
        {{ item.label }}
      </n-badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { OrderStatics } from '@/api/order'

const props = withDefaults(
  defineProps<{
    orderStatics: OrderStatics
    defaultActivity: number
  }>(),
  { orderStatics: () => ({}), defaultActivity: 0 },
)

const emit = defineEmits<{ tabChange: [status: number] }>()

const activeTab = ref(props.defaultActivity)

watch(
  () => props.defaultActivity,
  (val) => {
    activeTab.value = Number(val)
  },
)

const tabList = computed(() => [
  { label: '全部订单', value: 0 },
  { label: '待接单', value: 2, num: props.orderStatics.toBeConfirmed },
  { label: '待派送', value: 3, num: props.orderStatics.confirmed },
  { label: '派送中', value: 4, num: props.orderStatics.deliveryInProgress },
  { label: '已完成', value: 5 },
  { label: '已取消', value: 6 },
])

const tabChange = (status: number) => {
  activeTab.value = status
  emit('tabChange', status)
}
</script>

<style lang="scss" scoped>
.tab-change {
  display: flex;
  border-radius: 4px;
  margin-bottom: 20px;

  .tab-item {
    width: 120px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    color: #333;
    border: 1px solid #e5e4e4;
    background-color: white;
    border-left: none;
    cursor: pointer;
  }

  .tab-item:first-child {
    border-left: 1px solid #e5e4e4;
  }

  .active {
    background-color: #ffc200;
    font-weight: bold;
  }

  :deep(.n-badge-sup) {
    background-color: #fd3333 !important;
  }
}
</style>
