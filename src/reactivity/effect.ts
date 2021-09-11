class ReactiveEffect {
  private _fn: any

  constructor (fn) {
    this._fn = fn
  }
  run() {
    activeEffect = this
    this._fn()
  }

}


const targetMap = new Map()
export function track (target, key) {
  // target -> key -> dep
  // 通过 先取 target 再取 key 找到对应的 dep 然后操作。
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, targetMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  dep.add(activeEffect)
  // const dep = new Set()
}

export function trigger (target, key) {
  // 取出对应的dep循环调用
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)

  for (let effect of dep) {
    effect.run()
  }
}

// 创建全局变量存储fn
let activeEffect

export function effect (fn) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}