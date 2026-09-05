import { onBeforeUnmount } from 'vue'

export interface OrderSocketMsg {
  type: number
  content: string
  orderId?: number | string
}

/**
 * 订单实时通知 WebSocket。
 * 地址优先取 VITE_SOCKET_URL，为空时走开发代理 /ws（vite.config.ts 中配置 ws: true）。
 */
export function useOrderWebSocket(handlers: {
  onMessage: (msg: OrderSocketMsg) => void
  onError?: () => void
}) {
  let socket: WebSocket | null = null
  let closedByUser = false

  const connect = () => {
    if (typeof WebSocket === 'undefined') return
    const clientId = Math.random().toString(36).slice(2)
    const base =
      import.meta.env.VITE_SOCKET_URL ||
      `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/`
    socket = new WebSocket(base + clientId)

    socket.onmessage = (msg) => {
      try {
        handlers.onMessage(JSON.parse(msg.data) as OrderSocketMsg)
      } catch {
        /* 忽略非 JSON 消息 */
      }
    }

    socket.onerror = () => {
      handlers.onError?.()
    }

    socket.onclose = () => {
      socket = null
    }
  }

  const close = () => {
    closedByUser = true
    socket?.close()
    socket = null
  }

  onBeforeUnmount(close)

  return { connect, close, get closed() { return closedByUser } }
}
