const extend = Object.assign

const isObject = (val) => {
  return val !== null && typeof val === 'object'
}

const haschange = (newValue, oldValue) => {
  return !Object.is(newValue, oldValue)
}


export {
  extend,
  isObject,
  haschange
}
