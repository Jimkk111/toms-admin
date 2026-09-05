import type { RouteRecordRaw } from 'vue-router'

const categoryRoutes: RouteRecordRaw[] = [
  {
    path: 'category',
    name: 'Category',
    component: () => import('@/views/category/index.vue'),
    meta: { title: '分类管理', icon: 'icon-category' },
  },
]

export default categoryRoutes
