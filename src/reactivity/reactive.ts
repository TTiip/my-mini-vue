import { mutableHandlers, readOnlyHandlers, shallowReadonlyHandlers } from './baseHandler'
import { ReactiveFlags } from './enum'
import { isObject } from '../shared'

const createReactiveObject = (target, baseHandles) => {
  if (!isObject(target)) {
    console.warn(`target ${target} 必须是一个对象`);
    return target
  }

  return new Proxy(target, baseHandles);
}

const reactive = (raw) => {
  return createReactiveObject(raw, mutableHandlers)
}

const readonly = (raw) => {
  return createReactiveObject(raw, readOnlyHandlers)
}

const isReactive = (raw) => {
  // 这里只需要返回的是false或者是true undefined直接转换成 boolean
  return !!raw[ReactiveFlags.IS_REACTIVE]
}

const isReadonly = (raw) => {
  // 这里只需要返回的是false或者是true undefined直接转换成 boolean
  return !!raw[ReactiveFlags.IS_READONLY]
}

// 外层是 readonly 内层不是
const shallowReadonly = (raw) => {
  return createReactiveObject(raw, shallowReadonlyHandlers)
}

// 判断是不是 reactive 或者 readonly 是的话 肯定是proxy对象
const isProxy = (raw) => {
  return isReactive(raw) || isReadonly(raw)
}

export {
  createReactiveObject,
  reactive,
  readonly,
  isReactive,
  isReadonly,
  shallowReadonly,
  isProxy
}
