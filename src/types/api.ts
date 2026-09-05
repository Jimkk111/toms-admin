export interface ApiResponse<T = unknown> {
  code: string | number
  msg?: string
  data: T
  /** 部分接口用 status 表达业务态（如 401 未登录） */
  status?: number
}
