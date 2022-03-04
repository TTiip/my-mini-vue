import { ReactiveEffect } from './effect'

class ComputedRefImpl {
	// private _getter: any
  private _value: any
  private _effect: any
  private _dirty: boolean = true
	constructor (getter) {
		// this._getter = getter
		this._effect = new ReactiveEffect(getter, () => {
			if (!this._dirty) {
				this._dirty = true
			}
		})
	}
	get value () {
		// get value --> _dirty is true
		// 当依赖的响应式对象发生改变的时候 修改 _dirty
		// effect
		if (this._dirty) {
			this._dirty = false
			this._value = this._effect.run()
		}
		return this._value
	}
}


const computed = (getter) => {
	return new ComputedRefImpl(getter)
}

export {
	computed
}