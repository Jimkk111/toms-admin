/** 是否有删除权限（构建期由 VITE_DELETE_PERMISSIONS 注入） */
export const checkDeletePermission = () => import.meta.env.VITE_DELETE_PERMISSIONS === 'true'

export const debounce = <T extends (...args: never[]) => void>(fn: T, time = 200) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn.apply(this, args)
    }, time)
  }
}

export const throttle = <T extends (...args: never[]) => void>(fn: T, time = 1000) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) return
    timer = setTimeout(() => {
      timer = null
    }, time)
    fn.apply(this, args)
  }
}

/** 判断数字字符串是否为负数 */
export const strIncrease = (str: string) => str.slice(0, 1) === '-'
