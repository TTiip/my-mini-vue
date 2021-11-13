import { getCurrentInstance } from './component'

const provide = (key, value) => {
	// 存
	// key value
	const currentInstance: any = getCurrentInstance()
	// 因为这个 getCurrentInstance 只能在 setup 下使用 所以 provide inject 也必须只能在setup中使用
	if (currentInstance) {
		let { provides, parent } = currentInstance
		const parentProvides = parent?.provides

		// init 初始化 不能每次都初始化（避免一个组件中 provide 多次 后面会覆盖前面的）
		// 如果 调用过 provide 则 parent.provides 和 provides 一定不相同，因为肯定修改了某个值。
		if (provides === parentProvides) {
			provides = currentInstance.provides = Object.create(parentProvides)
		}

		provides[key] = value
	}
}

const inject = (key, defaultVal) => {
	// 取
	const currentInstance: any = getCurrentInstance()
	if (currentInstance) {
		const { parent }  = currentInstance
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