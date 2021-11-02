const extend = Object.assign

const isObject = (val) => {
  return val !== null && typeof val === 'object'
}


export {
  extend,
  isObject
}
