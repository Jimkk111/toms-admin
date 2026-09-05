<template>
  <div class="container">
    <h2 class="homeTitle">订单统计</h2>
    <div class="charBox">
      <div class="orderProportion">
        <div>
          <p>订单完成率</p>
          <p>{{ completionRate }}</p>
        </div>
        <div class="symbol">=</div>
        <div>
          <p>有效订单</p>
          <p>{{ orderdata.validOrderCount }}</p>
        </div>
        <div class="symbol">/</div>
        <div>
          <p>订单总数</p>
          <p>{{ orderdata.totalOrderCount }}</p>
        </div>
      </div>
      <ul class="orderListLine">
        <li class="one"><span />订单总数（个）</li>
        <li class="three"><span />有效订单（个）</li>
      </ul>
      <BaseChart
        :option="option"
        height="300px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from '@/components/BaseChart/index.vue'

const props = defineProps<{
  orderdata: {
    data: { dateList: string[]; orderCountList: string[]; validOrderCountList: string[] }
    totalOrderCount: number
    validOrderCount: number
    orderCompletionRate: number
  }
}>()

const completionRate = computed(() =>
  props.orderdata.orderCompletionRate
    ? `${(props.orderdata.orderCompletionRate * 100).toFixed(1)}%`
    : '0%',
)

const option = computed<EChartsOption | null>(() => {
  if (!props.orderdata.data?.dateList?.length) return null
  return {
    tooltip: { trigger: 'axis' },
    grid: { top: '5%', left: '20', right: '50', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLabel: { color: '#666', fontSize: 12 },
      axisLine: { lineStyle: { color: '#E5E4E4', width: 1 } },
      data: props.orderdata.data.dateList,
    },
    yAxis: [{ type: 'value', min: 0, axisLabel: { color: '#666', fontSize: 12 } }],
    series: [
      {
        name: '订单总数',
        type: 'line',
        smooth: false,
        showSymbol: false,
        symbolSize: 10,
        itemStyle: { color: '#F29C1B', borderColor: '#FFC100', borderWidth: 2 },
        lineStyle: { color: '#FFD000' },
        data: props.orderdata.data.orderCountList,
      },
      {
        name: '有效订单',
        type: 'line',
        smooth: false,
        showSymbol: false,
        symbolSize: 10,
        itemStyle: { color: '#EC808D' },
        lineStyle: { color: '#EC808D' },
        data: props.orderdata.data.validOrderCountList,
      },
    ],
  }
})
</script>

<style lang="scss" scoped>
.orderProportion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 10px 0;

  p {
    text-align: center;
    margin: 0;

    &:first-child {
      font-size: 12px;
      color: #818693;
    }

    &:last-child {
      font-size: 20px;
      font-weight: 700;
    }
  }

  .symbol {
    font-size: 20px;
    color: #818693;
  }
}
</style>
