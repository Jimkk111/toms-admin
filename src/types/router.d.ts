// 必须是模块上下文（有 import）才能形成 module augmentation，
// 否则会变成 ambient module 声明，遮蔽 vue-router 真实类型
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题/侧边栏文案 */
    title?: string
    /** 侧边栏图标（iconfont 类名） */
    icon?: string
    /** 不显示在侧边栏 */
    hidden?: boolean
    /** 免登录页 */
    notNeedAuth?: boolean
    /** 固定页签 */
    affix?: boolean
  }
}
