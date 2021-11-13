import { PublicInstanceProxyhandle } from'./componentPublicInstance'
import { initProps } from './componentProps'
import { initSlots } from './componentSlots'
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from '../runtime-core/componentEmit'

let currentInstance = null

const createComponentInstance = (vnode, parent) => {
	const component = {
		vnode,
		type: vnode.type,
		setupState: {},
		props: {},
		slots: {},
		// provides: parent ? JSON.parse(JSON.stringify(parent.provides)) : {},
		provides: parent ? parent.provides : {},
		parent,
		emit: (...arg) => {}
	}

	component.emit = emit.bind(null, component)

	return component
}

const setupComponent = (instance) => {
	// Todo
	initProps(instance, instance.vnode.props)
	initSlots(instance, instance.vnode.children)

	setupStatefulComponent(instance)
}

const setupStatefulComponent = (instance) => {
	const Component = instance.type

	// 封装暴露 ctx
	// 方便 后续调用获取值，通过代理去 返回值
	instance.proxy = new Proxy(
		{_: instance},
		PublicInstanceProxyhandle
	)

	// 此处是 调用用户写的 setup 函数
	const { setup } = Component
	// 如果用户写了 setup
	if (setup) {
		// 利用全局变量 存储 当前组件的实例
		// 封装函数 方便调用追溯 即 中间层 思想
		setCurrentInstance(instance)
		// function 或者 object
		const setupResult = setup(shallowReadonly(instance.props), {
			emit: instance.emit
		})
		// 当组件setup执行完成以后 清空 currentInstance 保证 getCurrentInstance 只能在setup里面使用
		currentInstance = null
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

const setCurrentInstance = (instance) => {
	currentInstance = instance
}

const getCurrentInstance = () => {
	return currentInstance
}

export {
	createComponentInstance,
	setupComponent,
	setupStatefulComponent,
	handleSetupResult,
	finishComponentSetup,
	getCurrentInstance
}
