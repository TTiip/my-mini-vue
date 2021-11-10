const createComponentInstance = (vnode) => {
	const component = {
		vnode,
		type: vnode.type,
		setupState: {}
	}

	return component
}

const setupComponent = (instance) => {
	// Todo
	// initProps
	// initSlots

	setupStatefulComponent(instance)
}

const setupStatefulComponent = (instance) => {
	const Component = instance.type

	// 封装暴露 ctx
	// 方便 后续调用获取值，通过代理去 返回值
	instance.proxy = new Proxy(
		{},
		{
			get(target, key) {
				// setupState 里面去获取值
				const { setupState } = instance
				if (key in setupState) {
					return setupState[key]
				}
			}
		}
	)

	const { setup } = Component
	// 如果用户写了 setup
	if (setup) {
		// function 或者 object
		const setupResult = setup()
		handleSetupResult(instance, setupResult)
	}
}

const handleSetupResult = (instance, setupResult) => {
	// Todo function
	if (typeof setupResult === 'object') {
		// 如果是对象则直接赋值
		instance.setupState = setupResult
	}

	finishComponentSetup(instance)
}

const finishComponentSetup = (instance) => {
	// 先判断 组件上有没有render
	const Component = instance.type
	instance.render = Component.render
	// if (Component.render) {
	// 	instance.render = Component.render
	// }
}

export {
	createComponentInstance,
	setupComponent,
	setupStatefulComponent,
	handleSetupResult,
	finishComponentSetup
}
