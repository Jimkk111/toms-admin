import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Message } from 'element-ui'
import { Route } from 'vue-router'
import { UserModule } from '@/store/modules/user'
import Cookies from 'js-cookie'

NProgress.configure({ 'showSpinner': false })

router.beforeEach(async (to: Route, _: Route, next: any) => {
  NProgress.start()
  // JWT 由后端 Set-Cookie 写入（可能为 HttpOnly，JS 无法读取），
  // 因此用登录成功时写入的 user_info cookie 作为客户端登录态标记
  if (Cookies.get('user_info')) {
    next()
  } else {
    if (!to.meta.notNeedAuth) {
      next('/login')
    } else {
      next()
    }
  }
})

router.afterEach((to: Route) => {
  NProgress.done()
  document.title = to.meta.title
})
