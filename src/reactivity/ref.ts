import { hasChanged, isObject } from '../shared'
import { trackEffects, triggerEffects, isTracking } from './effect'
import { reactive } from './reactive'

class RefImpl {
	private _value
	private _rawValue
	public dep
	public __v_isRef = true
	constructor(value) {
		// value 如果是对象 要用 reactive 转换成响应式对象
		this._rawValue = value
		this._value = covert(value)
		this.dep = new Set()
	}
	get value () {
		trackRefValue(this)
		return this._value
	}
	set value (newValue) {
		if (hasChanged(this._rawValue, newValue)) {
			// 一定先修改值，再触发\
			this._rawValue = newValue
			this._value = covert(newValue)
			triggerEffects(this.dep)
		}
	}
}

const covert = (value) => {
	return isObject(value) ? reactive(value) : value
}

const trackRefValue = (ref) => {
	if (isTracking()) {
		trackEffects(ref.dep)
	}
}

const ref = (value) => {
	return new RefImpl(value)
}

const isRef = (ref) => {
	return !!ref.__v_isRef
}

const unRef = (ref) => {
	return isRef(ref) ? ref.value: ref
}

const proxyRefs = (objectWithRefs) => {
	// 如果获取的值 是 ref 类型 那么就返回 .value
	// 如果获取的值 不是 ref 那么就直接返回 它本身的值
	return new Proxy(objectWithRefs, {
		get (target, key) {
			return unRef(Reflect.get(target, key))
		},
		set (target, key, value) {
			// 看看是 是 ref 类型 是的话修改 .value
			// 看看是 不是 ref 类型 是的话修改 本身的值
			if (isRef(target[key]) && !isRef(value)) {
				return Reflect.set(target[key], 'value', value)
				// return target[key].value = value
			} else {
				return Reflect.set(target, key, value)
			}
		}
	})
}

export {
	ref,
	isRef,
	unRef,
	proxyRefs
}