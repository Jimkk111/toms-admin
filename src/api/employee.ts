import request from '@/utils/request'
import type { ApiResponse, PageData } from '@/types/api'

export interface EmployeeItem {
  id: number
  name: string
  username: string
  phone: string
  sex: string
  idNumber: string
  status: string | number
  updateTime: string
}

export interface EmployeeForm {
  username: string
  name: string
  phone: string
  sex: string
  idNumber: string
  id?: number
}

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

// 员工列表（POST 分页）
export const getEmployeeList = (data: { page: number; pageSize: number; name?: string }) =>
  request<ApiResponse<PageData<EmployeeItem>>>({
    url: '/employee/list',
    method: 'post',
    data,
  })

// 启用/禁用账号
export const enableOrDisableEmployee = (params: { id: number; status: number }) =>
  request<ApiResponse<null>>({
    url: `/employee/status/${params.status}`,
    method: 'post',
    params: { id: params.id },
  })

// 新增员工
export const addEmployee = (data: EmployeeForm) =>
  request<ApiResponse<null>>({
    url: '/employee',
    method: 'post',
    data,
  })

// 修改员工
export const editEmployee = (data: EmployeeForm) =>
  request<ApiResponse<null>>({
    url: '/employee',
    method: 'put',
    data,
  })

// 修改页反查详情
export const queryEmployeeById = (id: number | string) =>
  request<ApiResponse<EmployeeItem>>({
    url: `/employee/detail/${id}`,
    method: 'get',
  })
