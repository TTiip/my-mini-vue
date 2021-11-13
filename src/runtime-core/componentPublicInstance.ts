import { hasOwn } from '../shared'

const publicPropertiesMap = {
  $el: (instance) => instance.vnode.el,
  $slots: (instance) => instance.slots
}

const PublicInstanceProxyhandle = {
	get({ _: instance }, key) {
		// setupState 部分
		// setupState 里面去获取值
		const { setupState, props } = instance

		if (hasOwn(setupState, key)) {
			return setupState[key]
		} else if (hasOwn(props, key)) {
			return props[key]
		}

		// 如果去找你对应的 key 则表示存在对应的属性 直接调用方法获取值
		const publicGetter = publicPropertiesMap[key]
		if (publicGetter) {
			return publicGetter(instance)
		}
	}
}

export {
	PublicInstanceProxyhandle
}