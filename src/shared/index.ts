const extend = Object.assign

const isObject = (value) => {
	return value !== null && typeof value === 'object'
}

const hasChanged = (val, newValue) => {
  return !Object.is(val, newValue)
};

export {
	extend,
	isObject,
	hasChanged
}