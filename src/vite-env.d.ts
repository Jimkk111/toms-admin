/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** axios baseURL 与上传 action 前缀，值固定为 /api */
  readonly VITE_BASE_API: string
  /** 后端服务地址（devServer 代理目标） */
  readonly VITE_API_URL: string
  /** WebSocket 地址；为空时使用同源 /ws 代理 */
  readonly VITE_SOCKET_URL: string
  /** 删除按钮权限 */
  readonly VITE_DELETE_PERMISSIONS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
