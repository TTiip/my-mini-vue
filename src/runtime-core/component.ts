const createComponentInstance = (vnode) => {
	const component = {
		vnode,
		type: vnode.type
	}

	return component
}

const setupComponent = (instance) => {
	// Todo
	// initProps
	// initSlot

	setupStatefulComponent(instance)
}

const setupStatefulComponent = (instance) => {
	const Component = instance.type

	const { setup } = Component
	// 如果用户写了 setup
	if (setup) {
		// function 或者 object
		const setupResult = setup()
		handleSetupResult(instance, setupResult)
	}
}

const handleSetupResult = (instance, setupResult) => {
	// Tdo function
	if (typeof setupResult === 'object') {
		// 如果是对象则直接赋值
		instance.setupState = setupResult
	}

	finishComponentSetup(instance)
}

const finishComponentSetup = (instance) => {
	// 先判断 组件上有没有render
	const Component = instance.type
	if (!Component.render) {
		// Component.render = instance.render
		instance.render = Component.render
	}
}

export {
	createComponentInstance,
	setupComponent,
	setupStatefulComponent,
	handleSetupResult,
	finishComponentSetup
}
