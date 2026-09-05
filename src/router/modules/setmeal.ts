import type { RouteRecordRaw } from 'vue-router'

const setmealRoutes: RouteRecordRaw[] = [
  {
    path: 'setmeal',
    name: 'Setmeal',
    component: () => import('@/views/setmeal/index.vue'),
    meta: { title: '套餐管理', icon: 'icon-combo' },
  },
  {
    path: 'setmeal/add',
    name: 'AddSetmeal',
    component: () => import('@/views/setmeal/addSetmeal.vue'),
    meta: { title: '添加套餐', hidden: true },
  },
]

export default setmealRoutes
