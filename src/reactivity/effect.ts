import { extend } from "../shared"

// 创建全局变量存储fn
let activeEffect
let shouldTrack

const isTracking = () => {
  return shouldTrack && activeEffect !== undefined
}

class ReactiveEffect {
  private _fn: any
  deps = []
  active = true
  onStop?: () => void
  public scheduler: Function | undefined
  constructor (fn, scheduler?) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    // 1.收集依赖
    // shouldTrack 区分状态
    if (!this.active) {
      return this._fn()
    }
    shouldTrack = true
    activeEffect = this

    const result = this._fn()
    // reset
    shouldTrack = false
    return result
  }
  stop() {
    cleanupEffect(this)
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

const targetMap = new Map()
export function track (target, key) {
  // 变量都是false的时候不需要收集依赖
  if (!isTracking()) {
    return
  }

  // target -> key -> dep
  // 通过 先取 target 再取 key 找到对应的 dep 然后操作。
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  // 已经在 dep 中了 不用在添加
  if (dep.has(activeEffect)) {
    return
  }
  dep.add(activeEffect)
  // 当 activeEffect shouldTrack 存在时在执行push
  activeEffect.deps.push(dep)
}

export function trigger (target, key) {
  // 取出对应的dep循环调用
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)

  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function effect (fn, options: any = {}) {
  const _effect: any = new ReactiveEffect(fn, options.scheduler)
  // 将options所有的属性继承（赋值）给实例对象_effect
  extend(_effect, options)
  _effect.run()

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function stop (runner) {
  runner.effect.stop()
}
