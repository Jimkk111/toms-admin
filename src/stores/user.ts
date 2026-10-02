import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, type LoginForm, type LoginVO } from '@/api/employee'
import { message } from '@/utils/feedback'
import {
  getUsername,
  getUserInfo,
  removeLegacyToken,
  removeUserInfo,
  removeUsername,
  setUserInfo,
  setUsername,
} from '@/utils/cookies'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<LoginVO | null>(getUserInfo<LoginVO>())
  const username = ref(getUsername() ?? '')

  /** 展示名：优先 userInfo.name，回退 username */
  const name = computed(() => userInfo.value?.name || username.value || '')

  async function login(form: LoginForm) {
    const trimmed = form.username.trim()
    const { data } = await loginApi({ ...form, username: trimmed })
    if (String(data.code) === '1') {
      // JWT 由后端通过 Set-Cookie 下发给浏览器，前端不接触 token 本身，
      // 仅保留用户信息 cookie 作为客户端登录态标记（路由守卫依赖它）
      userInfo.value = data.data
      username.value = trimmed
      setUserInfo(data.data)
      setUsername(trimmed)
      removeLegacyToken()
      return data
    }
    message.error(data.msg ?? '登录失败')
    return data
  }

  async function logout() {
    // 后端登出接口通过 Set-Cookie 清除 JWT cookie
    try {
      await logoutApi()
    } finally {
      userInfo.value = null
      username.value = ''
      removeUserInfo()
      removeUsername()
      removeLegacyToken()
    }
  }

  return { userInfo, username, name, login, logout }
})
