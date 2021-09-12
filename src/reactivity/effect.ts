class ReactiveEffect {
  private _fn: any
  deps = []
  public scheduler: Function | undefined
  constructor (fn, scheduler?) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    activeEffect = this
    return this._fn()
  }
  stop() {
    this.deps.forEach((dep: any) => dep.delete(this))
  }
}


const targetMap = new Map()
export function track (target, key) {
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
  dep.add(activeEffect)
  // 当 activeEffect 存在时在执行push
  if (!activeEffect) return
  activeEffect.deps.push(dep)
  // const dep = new Set()
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

// 创建全局变量存储fn
let activeEffect

export function effect (fn, options: any = {}) {
  const _effect: any = new ReactiveEffect(fn, options.scheduler)
  _effect.run()

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function stop (runner) {
  runner.effect.stop()
}
