import { toHandlerKey } from '../shared/index'

const emit = (instance, eventName, ...args) => {
  const { props } = instance
  const handlerName = toHandlerKey(eventName)
  const handler = props[handlerName]

  handler && handler(...args)
}

export { emit }
