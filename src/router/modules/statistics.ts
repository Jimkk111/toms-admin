import type { RouteRecordRaw } from 'vue-router'

const statisticsRoutes: RouteRecordRaw[] = [
  {
    path: 'statistics',
    name: 'Statistics',
    component: () => import('@/views/statistics/index.vue'),
    meta: { title: '数据统计', icon: 'icon-statistics' },
  },
]

export default statisticsRoutes
