<template>
  <div class="container">
    <h2 class="homeTitle">营业额统计</h2>
    <div class="charBox">
      <ul class="orderListLine turnover">
        <li>营业额(元)</li>
      </ul>
      <BaseChart
        :option="option"
        height="320px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from '@/components/BaseChart/index.vue'

const props = defineProps<{
  turnoverdata: { dateList: string[]; turnoverList: string[] }
}>()

const option = computed<EChartsOption | null>(() => {
  if (!props.turnoverdata.dateList?.length) return null
  return {
    tooltip: { trigger: 'axis' },
    grid: { top: '5%', left: '10', right: '50', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLabel: { color: '#666', fontSize: 12 },
      axisLine: { lineStyle: { color: '#E5E4E4', width: 1 } },
      data: props.turnoverdata.dateList,
    },
    yAxis: [{ type: 'value', min: 0, axisLabel: { color: '#666', fontSize: 12 } }],
    series: [
      {
        name: '营业额',
        type: 'line',
        smooth: false,
        showSymbol: false,
        symbolSize: 10,
        itemStyle: { color: '#F29C1B', borderColor: '#FFC100', borderWidth: 2 },
        lineStyle: { color: '#FFD000' },
        data: props.turnoverdata.turnoverList,
      },
    ],
  }
})
</script>
