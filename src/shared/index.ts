import { ShapeFlags } from './ShapeFlags'

const extend = Object.assign

// 设置一个全局空对象方便后续曲比较
const EMPTY_OBJ = {}

const isObject = (value) => {
	return value !== null && typeof value === 'object'
}

const hasChanged = (val, newValue) => {
  return !Object.is(val, newValue)
}

const getShapeFlag = (type) => {
	return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}

const hasOwn = (val = {}, key) => Object.prototype.hasOwnProperty.call(val, key)

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const camelize = (str: string) => {
	// ex: add-foo
	// _ 代表匹配到的值规则（-f）
	// targetValue 代表匹配到的值（f）
	return str.replace(/-(\w)/g, (_, targetValue: string) => {
		return targetValue ? targetValue.toUpperCase() : ''
	})
}
// add --> onAdd
const toHandlerKey = (str: string) => str ? camelize('on' + capitalize(str)) : ''

export {
	extend,
	EMPTY_OBJ,
	isObject,
	hasChanged,
	getShapeFlag,
	hasOwn,
	camelize,
	toHandlerKey
}