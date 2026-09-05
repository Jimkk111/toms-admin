export interface ApiResponse<T = unknown> {
  code: string | number
  msg?: string
  desc?: string
  data: T
  /** 部分接口用 status 表达业务态（如 401 未登录） */
  status?: number
}

/** 后端分页返回的统一结构（records + total） */
export interface PageData<T> {
  records: T[]
  total: number | string
  [key: string]: unknown
}
