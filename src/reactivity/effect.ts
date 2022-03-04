import { extend } from '../shared'

let activeEffect
let shouldTrack
class ReactiveEffect {
	private _fn: any
	public _scheduler: any
	onStop?: () => void
	active = true // stop 状态
	deps = []

	constructor(fn, scheduler?){
		this._fn = fn
		this._scheduler = scheduler
	}

	run() {
		// 会收集依赖
		// shouldTrack 来做区分
		if (!this.active) {
			return this._fn()
		}

		shouldTrack = true
		activeEffect = this
		const res = this._fn()
		// 全局变量 reset
		shouldTrack = false

		return res
	}

	stop () {
		if (this.active) {
			cleanUpEffect(this)
			this.active = false
			if (this.onStop) {
				this.onStop()
			}
		}
	}
}
const isTracking = () => {
	// 判断是不是 应该 收集依赖 & 有没有全局的 effect
  return shouldTrack && activeEffect !== undefined
}

const cleanUpEffect = (effect) => {
	effect.deps.map((dep: any) => {
		dep.delete(effect)
	})
	effect.deps.length = 0
}

const effect = (fn, options: any = {}) => {
	const { scheduler } = options
	// 初始化的时候就需要调用一次fn
	const _effect = new ReactiveEffect(fn, scheduler)

	// 将调用 options 中的参数 和 类上同名参数赋值
	// onStop --> onStop
	extend(_effect, options)

	_effect.run()

	// 将传进来的 fn 返回出去
	// bind 以当前的 effect 实例作为函数的 this 指针
	const runner: any = _effect.run.bind(_effect)
	runner.effect = _effect

	return runner
}

const targetMap = new Map()

const trackEffects = (dep) => {
	// 如果没有 effect 实例直接不做后面的操作
	// if (!activeEffect) return
	// if (!shouldTrack) return

	dep.add(activeEffect)
	activeEffect.deps.push(dep)
}

const track = (target, key) => {
	if (!isTracking()) return
	// target --> key --> dep
	let depsMap = targetMap.get(target)
	// 不存在despMap 先初始化一下
	if (!depsMap) {
		depsMap = new Map()
		targetMap.set(target, depsMap)
	}

	// 不存在dep 先初始化一下
	let dep = depsMap.get(key)
	if (!dep) {
		dep = new Set()
		depsMap.set(key, dep)
	}
	trackEffects(dep)
}

const triggerEffects = (dep) => {
	// 循环调用 dep 的 run 方法 触发每一个 dep 的 _fn
	for (const effect of dep) {
		if (effect._scheduler) {
			effect._scheduler()
		} else {
			effect.run()
		}
	}
}

const trigger = (target, key) => {
	// 取出 target 对应的 depsMap
	let depsMap = targetMap.get(target)

	// 取出 key 对应的 dep
	let dep = depsMap.get(key)
	triggerEffects(dep)
}
const stop = (runner) => {
	runner.effect.stop()
}



export {
	ReactiveEffect,
	effect,
	isTracking,
	track,
	trackEffects,
	trigger,
	triggerEffects,
	stop
}