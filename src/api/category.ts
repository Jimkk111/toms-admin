import request from '@/utils/request'
import type { ApiResponse, PageData } from '@/types/api'

export type CategoryItem = {
  id: number
  name: string
  type: string | number
  sort: number
  status: string | number
  updateTime: string
}

// 查询分类列表
export const getCategoryPage = (params: {
  page: number
  pageSize: number
  name?: string
  type?: number
}) =>
  request<ApiResponse<PageData<CategoryItem>>>({
    url: '/category/page',
    method: 'get',
    params,
  })

// 删除分类
export const deleCategory = (id: number | string) =>
  request<ApiResponse<null>>({
    url: '/category',
    method: 'delete',
    params: { id },
  })

// 修改分类
export const editCategory = (data: { id: number; name: string; sort: number | string }) =>
  request<ApiResponse<null>>({
    url: '/category',
    method: 'put',
    data,
  })

// 新增分类
export const addCategory = (data: { name: string; type: string; sort: number | string }) =>
  request<ApiResponse<null>>({
    url: '/category',
    method: 'post',
    data,
  })

// 启用/禁用分类
export const enableOrDisableCategory = (params: { id: number; status: number }) =>
  request<ApiResponse<null>>({
    url: `/category/status/${params.status}`,
    method: 'post',
    params: { id: params.id },
  })
