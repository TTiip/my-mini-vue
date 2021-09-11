import { track, trigger } from './effect'

export function reactive (raw) {
  return new Proxy(raw, {
    get (target, key) {
      const res = Reflect.get(target, key)
      // 收集依赖
      track(target, key)
      return res
    },
    set (target, key, value) {
      const res = Reflect.set(target, key, value)
      trigger(target, key)
      // 触发依赖
      return res
    }
  })
}
