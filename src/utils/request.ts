import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/api'
import { message } from '@/utils/feedback'
import router from '@/router'

// 同一请求在途时取消后来的重复请求
const pending = new Map<string, AbortController>()

const getRequestKey = (config: AxiosRequestConfig) =>
  [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join(
    '&',
  )

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 600000,
  // 登录态由后端通过 Set-Cookie 下发的 JWT（sky_admin_token）承载，请求需携带 cookie
  withCredentials: true,
})

service.interceptors.request.use((config) => {
  const key = getRequestKey(config)
  if (pending.has(key)) {
    // 重复请求：直接取消，不打扰在途请求
    const controller = new AbortController()
    config.signal = controller.signal
    controller.abort()
    return config
  }
  const controller = new AbortController()
  config.signal = controller.signal
  pending.set(key, controller)
  return config
})

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    pending.delete(getRequestKey(response.config))
    if (response.data?.status === 401) {
      router.push('/login')
      return Promise.reject(response)
    }
    return response
  },
  (error) => {
    if (error?.config) {
      pending.delete(getRequestKey(error.config))
    }
    // 被去重逻辑取消的请求静默处理
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }
    if (error?.response?.status === 401) {
      message.error('登录已失效，请重新登录')
      router.push('/login')
    } else {
      message.error(error?.response?.data?.msg || error?.message || '网络异常，请稍后重试')
    }
    return Promise.reject(error)
  },
)

export default service
