import type { RouteRecordRaw } from 'vue-router'

const orderRoutes: RouteRecordRaw[] = [
  {
    path: 'order',
    name: 'Order',
    component: () => import('@/views/orderDetails/index.vue'),
    meta: { title: '订单管理', icon: 'icon-order' },
  },
]

export default orderRoutes
