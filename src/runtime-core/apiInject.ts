import { getCurrentInstance } from './component'

const provide = (key, value) => {
  // 存
  const currentInstance = getCurrentInstance()
	if (currentInstance) {
		let { provides } = currentInstance
		const parentProvides = currentInstance.parent.provides
		// init
		// 只需要初始化的时候 执行一次
		// 当初始化完成以后实例的 provides 肯定是和父级的 provides相等
		// 调用过过 provide 以后 当前实例的 provides 肯定和父级不一样（因为有赋值操作）
		if (provides === parentProvides) {
			// 将当前 provide 实例的原型指向父级
			provides = currentInstance.provides = Object.create(parentProvides)
		}

		provides[key] = value
	}
}

const inject = (key, defaultVal) => {
  // 取
  const currentInstance = getCurrentInstance()
	if (currentInstance) {
		const { parent } = currentInstance
		const parentProvides = parent.provides
		if (key in parentProvides) {
			return parentProvides[key]
		} else if (defaultVal) {
			if (typeof defaultVal === 'function') {
				return defaultVal()
			}
			return defaultVal
		}
	}
}

export {
	provide,
	inject
}
