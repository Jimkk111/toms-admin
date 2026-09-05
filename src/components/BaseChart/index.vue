<template>
  <div
    ref="elRef"
    class="base-chart"
    :style="{ height }"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as echarts from 'echarts'
import { useChart } from '@/composables/useChart'

defineOptions({ name: 'BaseChart' })

const props = withDefaults(
  defineProps<{
    option: echarts.EChartsOption | null
    height?: string
  }>(),
  { height: '320px' },
)

const elRef = ref<HTMLElement | null>(null)
useChart(elRef, () => props.option)
</script>
