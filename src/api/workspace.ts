import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

// ==================== 工作台 ====================

export interface BusinessData {
  turnover: number
  validOrderCount: number
  orderCompletionRate: number
  unitPrice: number
  newUsers: number
}

export interface OrderOverview {
  allOrders: number
  cancelledOrders: number
  completedOrders: number
  deliveredOrders: number
  waitingOrders: number
}

export interface DishOverview {
  sold: number
  discontinued: number
}

/** 营业数据（今日） */
export const getBusinessData = () =>
  request<ApiResponse<BusinessData>>({
    url: '/workspace/businessData',
    method: 'get',
  })

/** 订单管理（今日） */
export const getOrderData = () =>
  request<ApiResponse<OrderOverview>>({
    url: '/workspace/overviewOrders',
    method: 'get',
  })

/** 菜品总览 */
export const getOverviewDishes = () =>
  request<ApiResponse<DishOverview>>({
    url: '/workspace/overviewDishes',
    method: 'get',
  })

/** 套餐总览 */
export const getSetMealStatistics = () =>
  request<ApiResponse<DishOverview>>({
    url: '/workspace/overviewSetmeals',
    method: 'get',
  })

// ==================== 数据统计 ====================

/** 营业额统计 */
export const getTurnoverStatistics = (params: { begin: string; end: string }) =>
  request<ApiResponse<{ dateList: string; turnoverList: string }>>({
    url: '/report/turnoverStatistics',
    method: 'get',
    params,
  })

/** 用户统计 */
export const getUserStatistics = (params: { begin: string; end: string }) =>
  request<ApiResponse<{ dateList: string; totalUserList: string; newUserList: string }>>({
    url: '/report/userStatistics',
    method: 'get',
    params,
  })

/** 订单统计 */
export const getOrderStatistics = (params: { begin: string; end: string }) =>
  request<
    ApiResponse<{
      dateList: string
      orderCountList: string
      validOrderCountList: string
      totalOrderCount: number
      validOrderCount: number
      orderCompletionRate: number
    }>
  >({
    url: '/report/ordersStatistics',
    method: 'get',
    params,
  })

/** 销量排名 TOP10 */
export const getTop = (params: { begin: string; end: string }) =>
  request<ApiResponse<{ nameList: string; numberList: string }>>({
    url: '/report/top10',
    method: 'get',
    params,
  })

/** 数据导出（Excel 二进制流） */
export const exportInfo = () =>
  request<Blob>({
    url: '/report/export',
    method: 'get',
    responseType: 'blob',
  })
