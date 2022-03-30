import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { initSlots } from './componentSlots'
import { publickInstanceProxyhandlers } from './componentPublicInstance'
import { proxyRefs } from '../reactivity'

let currentInstance

const createComponentInstance = (vnode, parent) => {
	const component = {
		vnode,
		type: vnode.type,
		props: {},
		emit: {},
		slots: {},
		next: null,
		setupState: {},
		parent,
		// parent,
		provides: parent ? parent.provides : {},
		insMounted: false,
		subTree: {}
	}
	component.emit = emit.bind(null, component)

	return component
}

const setupComponent = (instance) => {
	// initProps
	initProps(instance, instance.vnode.props)
	// initSlot
	initSlots(instance, instance.vnode.children)
	// initComponent
	setupStatefulComponent(instance)
}

const setupStatefulComponent = (instance) => {
	const Component = instance.type
	const { setup } = Component

	// ctx
	instance.proxy = new Proxy({
		_: instance
	}, publickInstanceProxyhandlers)

	// 用户可能不会写 setup 函数
	if (setup) {
		// 初始化获取 instance
		setCurrentInstance(instance)

		// 可以返回一个 fn 也可能是一个 object
		const setupResult = setup(shallowReadonly(instance.props), {
			emit: instance.emit
		})

		handleSetupResult(instance, setupResult)

		// 重制获取 instance
		setCurrentInstance(null)
	}
}

const handleSetupResult = (instance, setupResult) => {
	// function or object
	// TODO function

	if (typeof setupResult === 'object') {
		instance.setupState = proxyRefs(setupResult)
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

const getCurrentInstance = () => {
	return currentInstance
}

const setCurrentInstance = (instance) => {
  currentInstance = instance;
}

export {
	createComponentInstance,
	setupComponent,
	setupStatefulComponent,
	getCurrentInstance
}
