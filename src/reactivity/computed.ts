import { ReactiveEffect } from './effect'

class ComputedRefImpl {
	private _effect: any
	private _gertter: any
	private _value: any
	private _dirty = true
	constructor (gertter) {
		this._gertter = gertter
		this._effect = new ReactiveEffect(gertter, () => {
			if (!this._dirty) {
				this._dirty = true
			}
		})
	}
	// 当依赖的响应式对象的值发生改变的时候需要重新调用 _getter ,即 _dirty 为true
	get value () {
		if (this._dirty) {
			this._dirty = false
			this._value = this._effect.run()
		}
		return this._value
	}
	set value (value) {

	}
}

const computed = (getter) => {
	return new ComputedRefImpl(getter)
}

export {
	computed
}