<template>
  <div class="container">
    <h2 class="homeTitle">用户统计</h2>
    <div class="charBox">
      <ul class="orderListLine">
        <li class="one"><span />总用户量（个）</li>
        <li class="three"><span />新增用户（个）</li>
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
  userdata: {
    dateList: string[]
    totalUserList: string[]
    newUserList: string[]
  }
}>()

const option = computed<EChartsOption | null>(() => {
  if (!props.userdata.dateList?.length) return null
  return {
    tooltip: { trigger: 'axis' },
    grid: { top: '5%', left: '20', right: '50', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLabel: { color: '#666', fontSize: 12 },
      axisLine: { lineStyle: { color: '#E5E4E4', width: 1 } },
      data: props.userdata.dateList,
    },
    yAxis: [{ type: 'value', min: 0, axisLabel: { color: '#666', fontSize: 12 } }],
    series: [
      {
        name: '总用户量',
        type: 'line',
        smooth: false,
        showSymbol: false,
        symbolSize: 10,
        itemStyle: { color: '#F29C1B', borderColor: '#FFC100', borderWidth: 2 },
        lineStyle: { color: '#FFD000' },
        data: props.userdata.totalUserList,
      },
      {
        name: '新增用户',
        type: 'line',
        smooth: false,
        showSymbol: false,
        symbolSize: 10,
        itemStyle: { color: '#EC808D' },
        lineStyle: { color: '#EC808D' },
        data: props.userdata.newUserList,
      },
    ],
  }
})
</script>
