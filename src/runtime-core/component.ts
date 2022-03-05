const createComponentInstance = (vnode) => {
	const component = {
		vnode,
		type: vnode.type
	}

	return component
}

const setupComponent = (instance) => {
	// TODO initProps
	// TODO initSlot

	//
	setupStatefulComponent(instance)
}

const setupStatefulComponent = (instance) => {
	const Component = instance.type
	const { setup } = Component

	// 用户可能不会写 setup 函数
	if (setup) {
		// 可以返回一个 fn 也可能是一个 object
		const setupResult = setup()

		handleSetupResult(instance, setupResult)
	}
}

const handleSetupResult = (instance, setupResult) => {
	// function or object
	// TODO function

	if (typeof setupResult === 'object') {
		instance.setupState = setupResult
	}
	// 初始化 render 函数
	finishCompentSetup(instance)
}

const finishCompentSetup =(instance) => {
	const Component = instance.type
	const { render } = Component

	// render 存在时赋值
	if (render) {
		instance.render = render
	}
}

export {
	createComponentInstance,
	setupComponent,
	setupStatefulComponent
}