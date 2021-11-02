import { mutableHandlers, readOnlyHandlers } from './baseHandler'
import { ReactiveFlags } from './enum'

export function reactive (raw) {
  return new Proxy(raw, mutableHandlers)
}

export function readonly (raw) {
  return new Proxy(raw, readOnlyHandlers)
}

export function isReactive (raw) {
  // 这里只需要返回的是false或者是true undefined直接转换成 boolean
  return !!raw[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly (raw) {
  // 这里只需要返回的是false或者是true undefined直接转换成 boolean
  return !!raw[ReactiveFlags.IS_READONLY]
}
