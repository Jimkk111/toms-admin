import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getUserInfo } from '@/utils/cookies'

NProgress.configure({ showSpinner: false })

router.beforeEach((to, _from, next) => {
  NProgress.start()
  // JWT 由后端 Set-Cookie 写入（HttpOnly，JS 无法读取），浏览器请求时自动携带；
  // 因此用登录成功时写入的 user_info cookie 作为客户端登录态标记
  if (getUserInfo() || to.meta.notNeedAuth) {
    next()
  } else {
    next('/login')
  }
})

router.afterEach((to) => {
  NProgress.done()
  document.title = to.meta.title ?? '苍穹外卖'
})
