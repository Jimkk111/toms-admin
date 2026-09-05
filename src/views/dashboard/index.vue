<template>
  <div class="dashboard-container home">
    <!-- 营业数据 -->
    <Overview :overview-data="overviewData" />
    <!-- 订单管理 -->
    <OrderView :data="orderViewData" />
    <div class="homeMain">
      <!-- 菜品总览 -->
      <GoodsOverview
        :data="dishesData"
        title="菜品总览"
        link="/dish"
        link-text="菜品管理"
        add-link="/dish/add"
        add-text="新增菜品"
      />
      <!-- 套餐总览 -->
      <GoodsOverview
        :data="setMealData"
        title="套餐总览"
        link="/setmeal"
        link-text="套餐管理"
        add-link="/setmeal/add"
        add-text="新增套餐"
      />
    </div>
    <!-- 订单信息 -->
    <OrderList
      :order-statics="orderStatics"
      @refresh-statics="fetchOrderStatics"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  getBusinessData,
  getOrderData,
  getOverviewDishes,
  getSetMealStatistics,
  type BusinessData,
  type DishOverview,
  type OrderOverview,
} from '@/api/workspace'
import { getOrderListBy, type OrderStatics } from '@/api/order'
import { message } from '@/utils/feedback'
import Overview from './components/Overview.vue'
import OrderView from './components/OrderView.vue'
import GoodsOverview from './components/GoodsOverview.vue'
import OrderList from './components/OrderList.vue'

defineOptions({ name: 'Dashboard' })

const overviewData = ref<Partial<BusinessData>>({})
const orderViewData = ref<Partial<OrderOverview>>({})
const dishesData = ref<Partial<DishOverview>>({})
const setMealData = ref<Partial<DishOverview>>({})
const orderStatics = ref<OrderStatics>({})

const fetchOrderStatics = async () => {
  const { data } = await getOrderListBy()
  if (String(data.code) === '1') {
    orderStatics.value = data.data
  } else {
    message.error(data.msg ?? '获取订单统计失败')
  }
}

onMounted(async () => {
  const [business, orders, dishes, setmeals] = await Promise.allSettled([
    getBusinessData(),
    getOrderData(),
    getOverviewDishes(),
    getSetMealStatistics(),
  ])
  if (business.status === 'fulfilled') overviewData.value = business.value.data.data ?? {}
  if (orders.status === 'fulfilled') orderViewData.value = orders.value.data.data ?? {}
  if (dishes.status === 'fulfilled') dishesData.value = dishes.value.data.data ?? {}
  if (setmeals.status === 'fulfilled') setMealData.value = setmeals.value.data.data ?? {}
  fetchOrderStatics()
})
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
