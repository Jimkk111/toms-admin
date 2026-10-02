<template>
  <div class="container">
    <h2 class="homeTitle">
      今日数据<i>{{ days[1] }}</i>
      <span>
        <router-link to="/statistics">详细数据</router-link>
      </span>
    </h2>
    <div class="overviewBox">
      <ul>
        <li>
          <p class="tit">营业额</p>
          <p class="num">¥ {{ overviewData.turnover }}</p>
        </li>
        <li>
          <p class="tit">有效订单</p>
          <p class="num">{{ overviewData.validOrderCount }}</p>
        </li>
        <li>
          <p class="tit">订单完成率</p>
          <p class="num">{{ rate }}</p>
        </li>
        <li>
          <p class="tit">平均客单价</p>
          <p class="num">¥ {{ unitPrice }}</p>
        </li>
        <li>
          <p class="tit">新增用户</p>
          <p class="num">{{ overviewData.newUsers }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BusinessData } from '@/api/workspace'
import { getday } from '@/utils/date'

const props = defineProps<{ overviewData: Partial<BusinessData> }>()

const days = getday()
const rate = computed(() =>
  props.overviewData.orderCompletionRate
    ? `${(props.overviewData.orderCompletionRate * 100).toFixed(0)}%`
    : '0%',
)

// 后端返回的均价可能是长小数，统一保留两位
const unitPrice = computed(() =>
  props.overviewData.unitPrice != null
    ? Number(props.overviewData.unitPrice).toFixed(2)
    : '0.00',
)
</script>
