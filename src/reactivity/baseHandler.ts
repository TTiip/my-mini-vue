import { track, trigger } from './effect'
import { ReactiveFlags } from '../reactivity/enum'
import { reactive, readonly } from './reactive'
import { extend, isObject } from '../shared/index'

let get
let readOnlyGet
let shallowReadonlyGet
let set

const createGetter = (isReadOnly = false, shallow = false) => {
	const get = (target, key) => {
		// target: { foo: 1 }
		// key: foo
		if (key === ReactiveFlags.IS_REACTIVE) {
			// 通过 isReadOnly 来判断是不是 reactive 对象
			// return !isReadOnly

			// ？？？
			// 这里是不是可以直接指定为true，因为调用 getter 函数 肯定是 proxy 对象，所以一定是 reactive
			return true
		} else if (key === ReactiveFlags.IS_READONLY) {
			return isReadOnly
		}
		const res = Reflect.get(target, key)
		// 如果是 shallow 类型(即外层是响应是对象，里面的不是 且设计成只读模式)
		if (shallow) {
			return res
		}
		if (!isReadOnly) {
			// 依赖收集
			track(target, key)
		}

		// 看看 res 是不是 object
		if (isObject(res)) {
			return isReadOnly ? readonly(res) : reactive(res)
		}

		return res
	}
	return get
}

const createSetter = () => {
	const set = (target, key, value) => {
		const res = Reflect.set(target, key, value)
		// 触发依赖
		trigger(target, key)
		return res
	}
	return set
}

get = createGetter()
readOnlyGet = createGetter(true)
shallowReadonlyGet = createGetter(true, true)
set = createSetter()

const mutableHandlers = {
	get,
	set
}

const readonlyHandlers = {
	get: readOnlyGet,
	set (target, key, value) {
		console.warn(`key: ${key} set 失败, 因为 target:`, target, `是 readonly状态!`)
		return true
	}
}

const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
	get: shallowReadonlyGet
})

export {
	mutableHandlers,
	readonlyHandlers,
	shallowReadonlyHandlers
}
