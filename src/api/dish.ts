import request from '@/utils/request'
import type { ApiResponse, PageData } from '@/types/api'

export type DishItem = {
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

export interface DishFlavor {
  name: string
  value: string[]
}

export interface DishForm {
  id?: number
  name: string
  categoryId: number | string
  price: string
  image: string
  description?: string
  status?: number | boolean
  flavors: { name: string; value: string }[]
}

export interface CategoryOption {
  id: number
  name: string
}

// 查询菜品列表
export const getDishPage = (params: {
  page: number
  pageSize: number
  name?: string
  categoryId?: number | string
  status?: number | string
}) =>
  request<ApiResponse<PageData<DishItem>>>({
    url: '/dish/page',
    method: 'get',
    params,
  })

// 删除菜品（支持批量，逗号分隔）
export const deleteDish = (ids: string) =>
  request<ApiResponse<null>>({
    url: '/dish',
    method: 'delete',
    params: { ids },
  })

// 修改菜品
export const editDish = (data: DishForm) =>
  request<ApiResponse<null>>({
    url: '/dish',
    method: 'put',
    data,
  })

// 新增菜品
export const addDish = (data: DishForm) =>
  request<ApiResponse<null>>({
    url: '/dish',
    method: 'post',
    data,
  })

// 查询菜品详情
export const queryDishById = (id: number | string) =>
  request<ApiResponse<DishItem & { flavors: { name: string; value: string }[] }>>({
    url: `/dish/${id}`,
    method: 'get',
  })

// 获取分类列表（type: 1 菜品分类 / 2 套餐分类）
export const getCategoryList = (params: { type: number; page?: number; pageSize?: number }) =>
  request<ApiResponse<CategoryOption[]>>({
    url: '/category/list',
    method: 'get',
    params,
  })

// 按分类/名称查菜品（套餐选菜用）
export const queryDishList = (params: { categoryId?: number | string; name?: string }) =>
  request<ApiResponse<(DishItem & { copies?: number })[]>>({
    url: '/dish/list',
    method: 'get',
    params,
  })

// 起售/停售
export const dishStatusByStatus = (params: { id: number | string; status: string | number }) =>
  request<ApiResponse<null>>({
    url: `/dish/status/${params.status}`,
    method: 'post',
    params: { id: params.id },
  })
