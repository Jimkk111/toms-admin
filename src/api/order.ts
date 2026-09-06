import request from '@/utils/request'
import type { ApiResponse, PageData } from '@/types/api'

export type OrderItem = {
  id: number | string
  number: string
  status: number
  orderDishes?: string
  consignee?: string
  phone?: string
  address?: string
  orderTime?: string
  cancelTime?: string
  cancelReason?: string
  rejectionReason?: string
  deliveryTime?: string
  estimatedDeliveryTime?: string
  amount: number
  packAmount?: number
  remark?: string
  tablewareNumber?: number | string
  payMethod?: number
  checkoutTime?: string
  orderDetailList?: { name: string; number: number; amount: number }[]
}

// 查询订单列表
export const getOrderDetailPage = (params: {
  page: number
  pageSize: number
  number?: string
  phone?: string
  beginTime?: string
  endTime?: string
  status?: number
}) =>
  request<ApiResponse<PageData<OrderItem>>>({
    url: '/order/conditionSearch',
    method: 'get',
    params,
  })

// 查看订单详情
export const queryOrderDetailById = (orderId: number | string) =>
  request<ApiResponse<OrderItem>>({
    url: `/order/details/${orderId}`,
    method: 'get',
  })

// 派送
export const deliveryOrder = (id: number | string) =>
  request<ApiResponse<null>>({
    url: `/order/delivery/${id}`,
    method: 'put',
  })

// 完成
export const completeOrder = (id: number | string) =>
  request<ApiResponse<null>>({
    url: `/order/complete/${id}`,
    method: 'put',
  })

// 取消订单
export const orderCancel = (data: { id: number | string; cancelReason: string }) =>
  request<ApiResponse<null>>({
    url: '/order/cancel',
    method: 'put',
    data,
  })

// 接单
export const orderAccept = (data: { id: number | string }) =>
  request<ApiResponse<null>>({
    url: '/order/confirm',
    method: 'put',
    data,
  })

// 拒单
export const orderReject = (data: { id: number | string; rejectionReason: string }) =>
  request<ApiResponse<null>>({
    url: '/order/rejection',
    method: 'put',
    data,
  })

// 待接单/待派送/派送中数量统计
export interface OrderStatics {
  toBeConfirmed?: number
  confirmed?: number
  deliveryInProgress?: number
}

export const getOrderListBy = () =>
  request<ApiResponse<OrderStatics>>({
    url: '/order/statistics',
    method: 'get',
  })
