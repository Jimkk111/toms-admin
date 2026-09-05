<template>
  <div class="dashboard-container home">
    <!-- 标题 -->
    <TitleIndex
      :date-range="dateRange"
      @send-title-ind="getTitleNum"
    />
    <div class="homeMain">
      <!-- 营业额统计 -->
      <TurnoverChart :turnoverdata="turnoverData" />
      <!-- 用户统计 -->
      <UserChart :userdata="userData" />
    </div>
    <div class="homeMain homecon">
      <!-- 订单统计 -->
      <OrderChart :orderdata="orderData" />
      <!-- 销量排名TOP10 -->
      <TopChart :top10data="top10Data" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { get1stAndToday, past7Day, past30Day, pastWeek, pastMonth } from '@/utils/date'
import {
  getTurnoverStatistics,
  getUserStatistics,
  getOrderStatistics,
  getTop,
} from '@/api/workspace'
import { message } from '@/utils/feedback'
import TitleIndex from './components/TitleIndex.vue'
import TurnoverChart from './components/TurnoverChart.vue'
import UserChart from './components/UserChart.vue'
import OrderChart from './components/OrderChart.vue'
import TopChart from './components/TopChart.vue'

defineOptions({ name: 'Statistics' })

const dateRange = ref<[string, string]>(past7Day())
const turnoverData = ref<{ dateList: string[]; turnoverList: string[] }>({
  dateList: [],
  turnoverList: [],
})
const userData = ref<{ dateList: string[]; totalUserList: string[]; newUserList: string[] }>({
  dateList: [],
  totalUserList: [],
  newUserList: [],
})
const orderData = ref<{
  data: { dateList: string[]; orderCountList: string[]; validOrderCountList: string[] }
  totalOrderCount: number
  validOrderCount: number
  orderCompletionRate: number
}>({
  data: { dateList: [], orderCountList: [], validOrderCountList: [] },
  totalOrderCount: 0,
  validOrderCount: 0,
  orderCompletionRate: 0,
})
const top10Data = ref<{ nameList: string[]; numberList: string[] }>({
  nameList: [],
  numberList: [],
})

const split = (s?: string) => (s ? s.split(',') : [])

const init = async (begin: string, end: string) => {
  const [turnover, user, order, top] = await Promise.allSettled([
    getTurnoverStatistics({ begin, end }),
    getUserStatistics({ begin, end }),
    getOrderStatistics({ begin, end }),
    getTop({ begin, end }),
  ])
  if (turnover.status === 'fulfilled' && String(turnover.value.data.code) === '1') {
    const it = turnover.value.data.data
    turnoverData.value = { dateList: split(it.dateList), turnoverList: split(it.turnoverList) }
  }
  if (user.status === 'fulfilled' && String(user.value.data.code) === '1') {
    const it = user.value.data.data
    userData.value = {
      dateList: split(it.dateList),
      totalUserList: split(it.totalUserList),
      newUserList: split(it.newUserList),
    }
  }
  if (order.status === 'fulfilled' && String(order.value.data.code) === '1') {
    const it = order.value.data.data
    orderData.value = {
      data: {
        dateList: split(it.dateList),
        orderCountList: split(it.orderCountList),
        validOrderCountList: split(it.validOrderCountList),
      },
      totalOrderCount: it.totalOrderCount,
      validOrderCount: it.validOrderCount,
      orderCompletionRate: it.orderCompletionRate,
    }
  }
  if (top.status === 'fulfilled' && String(top.value.data.code) === '1') {
    const it = top.value.data.data
    top10Data.value = {
      nameList: split(it.nameList).reverse(),
      numberList: split(it.numberList).reverse(),
    }
  } else if (top.status === 'rejected') {
    message.error('获取销量排名失败')
  }
}

const getTitleNum = (index: number) => {
  switch (index) {
    case 1:
      dateRange.value = get1stAndToday()
      break
    case 2:
      dateRange.value = past7Day()
      break
    case 3:
      dateRange.value = past30Day()
      break
    case 4:
      dateRange.value = pastWeek()
      break
    case 5:
      dateRange.value = pastMonth()
      break
  }
  init(dateRange.value[0], dateRange.value[1])
}

onMounted(() => getTitleNum(2))
</script>

<style lang="scss" scoped>
.homeMain {
  display: flex;
  gap: 15px;
  margin-top: 15px;

  > * {
    flex: 1;
    min-width: 0;
  }
}
</style>
