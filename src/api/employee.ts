import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

export interface LoginForm {
  username: string
  password: string
}

/** 登录响应体（JWT 通过 Set-Cookie 下发，不在响应体中） */
export interface LoginVO {
  id: number
  userName: string
  name: string
}

// 登录
export const login = (data: LoginForm) =>
  request<ApiResponse<LoginVO>>({
    url: '/employee/login',
    method: 'post',
    data,
  })

// 退出（后端通过 Set-Cookie 清除 JWT cookie）
export const logout = () =>
  request<ApiResponse<null>>({
    url: '/employee/logout',
    method: 'post',
  })
