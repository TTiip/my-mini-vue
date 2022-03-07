import { ShapeFlags } from './ShapeFlags'

const extend = Object.assign

const isObject = (value) => {
	return value !== null && typeof value === 'object'
}

const hasChanged = (val, newValue) => {
  return !Object.is(val, newValue)
}

const getShapeFlag = (type) => {
	return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}

export {
	extend,
	isObject,
	hasChanged,
	getShapeFlag
}