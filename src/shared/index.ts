const extend = Object.assign

const isObject = (val) => {
  return val !== null && typeof val === 'object'
}

const haschange = (newValue, oldValue) => {
  return !Object.is(newValue, oldValue)
}

const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)


export {
  extend,
  isObject,
  haschange,
  hasOwn
}
