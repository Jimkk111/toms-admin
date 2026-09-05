import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

// 修改密码
export const editPassword = (data: { oldPassword: string; newPassword: string }) =>
  request<ApiResponse<null>>({
    url: '/employee/editPassword',
    method: 'put',
    data,
  })

// 获取营业状态：1 营业中 / 0 打烊中
export const getStatus = () =>
  request<ApiResponse<number>>({
    url: '/shop/status',
    method: 'get',
  })

// 设置营业状态
export const setStatus = (status: number) =>
  request<ApiResponse<null>>({
    url: `/shop/${status}`,
    method: 'put',
    data: status,
  })
