import type { RouteRecordRaw } from 'vue-router'

const dishRoutes: RouteRecordRaw[] = [
  {
    path: 'dish',
    name: 'Dish',
    component: () => import('@/views/dish/index.vue'),
    meta: { title: '菜品管理', icon: 'icon-dish' },
  },
  {
    path: 'dish/add',
    name: 'AddDish',
    component: () => import('@/views/dish/addDishtype.vue'),
    meta: { title: '添加菜品', hidden: true },
  },
]

export default dishRoutes
