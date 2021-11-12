const extend = Object.assign

const isObject = (val) => {
  return val !== null && typeof val === 'object'
}

const haschange = (newValue, oldValue) => {
  return !Object.is(newValue, oldValue)
}

const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)

const camelize = (str: string) => {
  // 匹配 -X 这种形式的字符, 第一个参数 为 -X， 第二个参数 为 X
  return str.replace(/-(\w)/g, (_, replacePart: string) => {
    return replacePart ? replacePart.toUpperCase() : ''
  })
}

const capitallize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const toHandlerKey = (str: string) => {
  return str ? `on${capitallize(str)}` : ''
}


export {
  extend,
  isObject,
  haschange,
  hasOwn,
  camelize,
  capitallize,
  toHandlerKey
}
