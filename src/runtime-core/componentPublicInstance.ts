import { hasOwn } from '../shared/index'

const publicPropertiesMap = {
	$el: (i) => i.vnode.el,
	$slots: (i) => i.slots,
	$props: (i) => i.props,
}

const publickInstanceProxyhandlers = {
	get({ _: instance }, key) {
		// setupState
		// 这里必须要在这里 获取 setupState
		// 因为 只有在初始化组件 的时候 获取 setupState
		const { setupState, props } = instance
		if (hasOwn(setupState, key)) {
			// setupState 里面获取值
			return setupState[key]
		} else if (hasOwn(props, key)) {
			return props[key]
		}

		// $el
		// if (key === '$el') {
		// 	// key --> $el
		// 	// 如果是 this.$el 则 key 值就是 $el
		// 	return vnode.el
		// }

		const publicGetter = publicPropertiesMap[key]
		if (publicGetter) {
			return publicGetter(instance)
		}
	}
}

export {
	publickInstanceProxyhandlers
}
