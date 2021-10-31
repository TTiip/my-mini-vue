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


export function reactive (raw) {
  return new Proxy(raw, {
    get: CreteGetter(),
    set: CreteSetter()
  })
}

export function readonly (raw) {
  return new Proxy(raw, {
    get: CreteGetter(true),
    set: CreteSetter()
  })
}
