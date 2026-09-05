import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'
import dashboardRoutes from './modules/dashboard'
import categoryRoutes from './modules/category'
import employeeRoutes from './modules/employee'
import dishRoutes from './modules/dish'
import setmealRoutes from './modules/setmeal'

// 与旧版约定一致：title 标题/侧边栏文案、icon（iconfont 类名）、hidden 不进侧边栏、
// notNeedAuth 免登录页、affix 固定页签
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '苍穹外卖', hidden: true, notNeedAuth: true },
  },
  {
    path: '/404',
    component: () => import('@/views/404.vue'),
    meta: { title: '苍穹外卖', hidden: true, notNeedAuth: true },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      ...dashboardRoutes,
      ...categoryRoutes,
      ...employeeRoutes,
      ...dishRoutes,
      ...setmealRoutes,
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { hidden: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router
