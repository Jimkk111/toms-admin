<template>
  <div class="container top10">
    <h2 class="homeTitle">销量排名TOP10</h2>
    <div class="charBox">
      <BaseChart
        :option="option"
        height="380px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from '@/components/BaseChart/index.vue'

const props = defineProps<{
  top10data: { nameList: string[]; numberList: string[] }
}>()

const option = computed<EChartsOption | null>(() => {
  if (!props.top10data.nameList?.length) return null
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: '5%', left: '10', right: '50', bottom: '5%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      axisLabel: { color: '#666', fontSize: 12 },
      axisLine: { lineStyle: { color: '#E5E4E4', width: 1 } },
      data: props.top10data.nameList,
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        barWidth: '40%',
        itemStyle: { color: '#289ADD', borderRadius: [0, 4, 4, 0] },
        data: props.top10data.numberList,
      },
    ],
  }
})
</script>
