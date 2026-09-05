import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators'
import { login,userLogout } from '@/api/employee'
import { getStoreId, setStoreId, setUserInfo, getUserInfo, removeUserInfo } from '@/utils/cookies'
import store from '@/store'
import Cookies from 'js-cookie'
import { Message } from 'element-ui'
export interface IUserState {
  name: string
  avatar: string
  storeId: string
  introduction: string
  userInfo: any
  roles: string[]
  username: string
}

@Module({ 'dynamic': true, store, 'name': 'user' })
class User extends VuexModule implements IUserState {
  public name = ''
  public avatar = ''
  // @ts-ignore
  public storeId: string = getStoreId() || ''
  public introduction = ''
  public userInfo = {}
  public roles: string[] = []
  public username = Cookies.get('username') || ''

  @Mutation
  private SET_NAME(name: string) {
    this.name = name
  }

  @Mutation
  private SET_USERINFO(userInfo: any) {
    this.userInfo = { ...userInfo }
  }

  @Mutation
  private SET_ROLES(roles: string[]) {
    this.roles = roles
  }

  @Mutation
  private SET_STOREID(storeId: string) {
    this.storeId = storeId
  }
  @Mutation
  private SET_USERNAME(name: string) {
    this.username = name
    }

  @Action
  public async Login(userInfo: { username: string, password: string }) {
    let { username, password } = userInfo
    username = username.trim()
    this.SET_USERNAME(username)
    Cookies.set('username', username)
    // 清理旧版前端手动写入的 token cookie 残留；
    // 现登录态由后端下发的 sky_admin_token cookie（HttpOnly）承载，前端无法也不需要操作它
    Cookies.remove('token')
    const { data } = await login({ username, password })
    if (String(data.code) === '1') {
      // JWT 由后端通过 Set-Cookie 下发给浏览器，前端不接触 token 本身，
      // 仅保留用户信息 cookie 作为客户端登录态标记（路由守卫依赖它）
      this.SET_USERINFO(data.data)
      Cookies.set('user_info', data.data)
      return data
    } else {
      return Message.error(data.msg)
    }
  }

  @Action
  public ResetToken () {
    this.SET_ROLES([])
    Cookies.remove('username')
    Cookies.remove('user_info')
    Cookies.remove('token')
    removeUserInfo()
  }

  @Action
  public async changeStore(data: any) {
    this.SET_STOREID(data.data)
    setStoreId(data.data)
  }

  @Action
  public async GetUserInfo () {
    // 登录响应体只包含 { id, userName, name }，从 cookie 反解后仅恢复展示信息
    const data = JSON.parse(<string>getUserInfo())
    if (!data) {
      throw Error('Verification failed, please Login again.')
    }

    this.SET_USERINFO(data)
    this.SET_NAME(data.name || data.userName)
  }

  @Action
  public async LogOut () {
    // 后端登出接口通过 Set-Cookie: sky_admin_token=; Max-Age=0 清除 JWT cookie
    const { data } = await userLogout({})
    Cookies.remove('username')
    Cookies.remove('user_info')
    Cookies.remove('token')
    removeUserInfo()
  }
}

export const UserModule = getModule(User)
