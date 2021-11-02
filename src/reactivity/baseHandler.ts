import { track, trigger } from './effect'
import { ReactiveFlags } from './enum'
import { reactive, readonly } from './reactive'
import { isObject } from '../shared'

const CreteGetter = (isReadonly = false) => {
  const get = (target, key) => {
    if (key === ReactiveFlags.IS_REACTIVE) {
      // 通过 isReactive 处理以后的对象或者值 会存在 ReactiveFlags.IS_REACTIVE
      // 存在 isReactive 即为 true
      return true
    }  else if (key === ReactiveFlags.IS_READONLY) {
      // 通过 isReadonly 处理以后的对象或者值 会存在 ReactiveFlags.IS_READONLY
      // 存在 isReadonly 即为 true
      return true
    }

    const res = Reflect.get(target, key)
    // 判断是不是对象 是的话 再次转化成reactive对象
    // 如果是 readonly 的话 则调用readonly转化
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

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

export {
	mutableHandlers,
	readOnlyHandlers
}
