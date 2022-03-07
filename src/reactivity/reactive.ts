import { isObject } from '../shared/index'
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandler'
import { ReactiveFlags } from './enum'

const createActiveObject = (raw, baseHandlers) => {
	if (!isObject(raw)) {
		console.warn(`target: ${raw} 必须是一个对象！`)
	} else {
		return new Proxy(raw, baseHandlers)
	}
}

const reactive = (raw) => {
	return createActiveObject(raw, mutableHandlers)
}

const readonly = (raw) => {
	return createActiveObject(raw, readonlyHandlers)
}

const isReactive = (raw) => {
	return !!raw[ReactiveFlags.IS_REACTIVE]
}

const isReadonly = (raw) => {
	return !!raw[ReactiveFlags.IS_READONLY]
}

const shallowReadonly = (raw) => {
	return createActiveObject(raw, shallowReadonlyHandlers)
}

const isProxy = (raw) => {
	return isReactive(raw) || isReadonly(raw)
}

const proxyRefs = (raw) => {
	return isReactive(raw) || isReadonly(raw)
}

export {
	reactive,
	readonly,
	isReactive,
	isReadonly,
	shallowReadonly,
	isProxy,
	proxyRefs
}