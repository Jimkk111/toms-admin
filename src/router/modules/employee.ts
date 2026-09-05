import type { RouteRecordRaw } from 'vue-router'

const employeeRoutes: RouteRecordRaw[] = [
  {
    path: 'employee',
    name: 'Employee',
    component: () => import('@/views/employee/index.vue'),
    meta: { title: '员工管理', icon: 'icon-employee' },
  },
  {
    path: 'employee/add',
    name: 'AddEmployee',
    component: () => import('@/views/employee/addEmployee.vue'),
    meta: { title: '添加员工', hidden: true },
  },
]

export default employeeRoutes
