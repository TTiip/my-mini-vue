import { track, trigger } from './effect'

const CreteGetter = (isReadonly = false) => {
  const get = (target, key) => {
    const res = Reflect.get(target, key)
    if (!isReadonly) {
      track(target, key)
    }
    return res
  }
  return get
}

const CreteSetter = () => {
  const set = (target, key, value) => {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    // 触发依赖
    return res
  }
  return set
}

// 初始化 优化性能,避免每次都调用

const get = CreteGetter()
const set = CreteSetter()
const readonlyGet = CreteGetter(true)

const mutableHandlers = {
  get,
  set
}

const readOnlyHandlers = {
  get: readonlyGet,
  set (target, key, value) {
    console.warn(`key: ${key} set 失败 因为 target 是 readonly!`, target)
    return true
  }
}

export function reactive (raw) {
  return new Proxy(raw, mutableHandlers)
}

export function readonly (raw) {
  return new Proxy(raw, readOnlyHandlers)
}
