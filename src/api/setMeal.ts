import request from '@/utils/request'
import type { ApiResponse, PageData } from '@/types/api'

export interface SetmealItem {
  id: number
  name: string
  image: string
  categoryId: number
  categoryName?: string
  price: number | string
  status: string | number
  updateTime: string
  description?: string
}

export interface SetmealDish {
  dishId: number | string
  name: string
  price: number | string
  copies: number
}

export interface SetmealForm {
  id?: number
  name: string
  categoryId: number | string
  price: string
  image: string
  description?: string
  status?: number | boolean
  setmealDishes: SetmealDish[]
}

// 查询套餐列表
export const getSetmealPage = (params: {
  page: number
  pageSize: number
  name?: string
  categoryId?: number | string
  status?: number | string
}) =>
  request<ApiResponse<PageData<SetmealItem>>>({
    url: '/setmeal/page',
    method: 'get',
    params,
  })

// 删除套餐（支持批量，逗号分隔）
export const deleteSetmeal = (ids: string) =>
  request<ApiResponse<null>>({
    url: '/setmeal',
    method: 'delete',
    params: { ids },
  })

// 修改套餐
export const editSetmeal = (data: SetmealForm) =>
  request<ApiResponse<null>>({
    url: '/setmeal',
    method: 'put',
    data,
  })

// 新增套餐
export const addSetmeal = (data: SetmealForm) =>
  request<ApiResponse<null>>({
    url: '/setmeal',
    method: 'post',
    data,
  })

// 查询套餐详情
export const querySetmealById = (id: number | string) =>
  request<ApiResponse<SetmealItem & { setmealDishes: SetmealDish[] }>>({
    url: `/setmeal/${id}`,
    method: 'get',
  })

// 起售/禁售
export const setmealStatusByStatus = (params: {
  ids: number | string
  status: string | number
}) =>
  request<ApiResponse<null>>({
    url: `/setmeal/status/${params.status}`,
    method: 'post',
    params: { id: params.ids },
  })
