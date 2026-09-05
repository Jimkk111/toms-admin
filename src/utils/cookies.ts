import Cookies from 'js-cookie'

const USER_INFO_KEY = 'user_info'
const USERNAME_KEY = 'username'
const STORE_ID_KEY = 'storeId'
const SIDEBAR_STATUS_KEY = 'sidebar_status'
// 旧版前端手动写入的 token cookie 名，登录/登出时清理残留
const LEGACY_TOKEN_KEY = 'token'

// userInfo（登录响应体 { id, userName, name }，客户端登录态标记）
export const getUserInfo = <T = unknown>(): T | null => {
  const raw = Cookies.get(USER_INFO_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
export const setUserInfo = (value: object) => Cookies.set(USER_INFO_KEY, JSON.stringify(value))
export const removeUserInfo = () => Cookies.remove(USER_INFO_KEY)

// username
export const getUsername = () => Cookies.get(USERNAME_KEY)
export const setUsername = (value: string) => Cookies.set(USERNAME_KEY, value)
export const removeUsername = () => Cookies.remove(USERNAME_KEY)

// storeId
export const getStoreId = () => Cookies.get(STORE_ID_KEY)
export const setStoreId = (id: string) => Cookies.set(STORE_ID_KEY, id)
export const removeStoreId = () => Cookies.remove(STORE_ID_KEY)

// 侧边栏开合状态
export const getSidebarStatus = () => Cookies.get(SIDEBAR_STATUS_KEY)
export const setSidebarStatus = (status: 'opened' | 'closed') =>
  Cookies.set(SIDEBAR_STATUS_KEY, status)

// 旧版 token 残留清理
export const removeLegacyToken = () => Cookies.remove(LEGACY_TOKEN_KEY)
