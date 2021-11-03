import { trackEffects, triggerEffects, isTracking } from './effect'
import { haschange, isObject } from '../shared'
import { reactive } from './reactive'

class RefImpl {
	public dep
	private  _value: any
	private  _rawValue: any
	private  __v_isRef = true
	constructor(value) {
		// 拿到最开始的值 因为如果传递进来的是一个对象可能在reactive以后就直接变成响应式对象了
		this._rawValue = value
		// value --> object 需要转换成一个reactive 对象
		this._value = convert(value)
		this.dep = new Set()
	}
	get value() {
		trackRefValue(this)
		return this._value
	}
	set value(newValue) {
		// 当 两次的值是一样的 不修改值 避免触发trigger。
		// 注意这里一定要比较之前的值 是一个普通对象 不用响应式对象去比较
		if (haschange(newValue, this._rawValue)) {
			this._rawValue = newValue
			this._value = convert(newValue)
			// 一定先修改值 再去触发
			triggerEffects(this.dep)
		}
	}
}

const ref = (value) => {
	return new RefImpl(value)
}

const convert = (value) => {
	return isObject(value) ? reactive(value) : value
}

const trackRefValue = (refInstance) => {
	if (isTracking()) {
		trackEffects(refInstance.dep)
	}
}

const isRef = (ref) => {
	return !!ref.__v_isRef
}

// 返回 xx.value 或者 直接返回value
const unRef = (ref) => {
	if (isRef(ref)) {
		return ref.value
	}
	return ref
}

const proxyRefs = (objectWithRefs) => {
	return new Proxy(objectWithRefs, {
		get (target, key) {
			// get -> age (ref) 给他返回 age.value
			// get -> age (not ref) 给他返回 age
			return unRef(Reflect.get(target, key))
		},
		// set -> age (ref) 修改他的 age.value
		// set -> age (not ref) 修改他的 age 直接使用 值 替换
		set (target, key, value) {
			if (isRef(target[key]) && !isRef(value)) {
				return target[key].value = value
			} else if (isRef(value)) {
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
