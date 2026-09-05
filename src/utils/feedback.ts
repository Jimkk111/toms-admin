import { createDiscreteApi } from 'naive-ui'

/**
 * 非组件上下文（axios 拦截器、路由守卫、store）中使用的全局反馈实例。
 * 组件内部请优先使用 useMessage() 等 setup API。
 */
export const { message, notification, dialog } = createDiscreteApi([
  'message',
  'notification',
  'dialog',
])
