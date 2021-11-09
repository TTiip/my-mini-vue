import { createComponentInstance, setupComponent } from './component'

const render = (vnode, container) => {
	//  patch -> 方便数据的处理
	patch(vnode, container)
}

const patch = (vnode, container) => {
	// 去处理组件

	// 判断 是不是 element
	processComponent(vnode, container)
}

const processComponent = (vnode, container) => {
	mountComponent(vnode, container)
}

const mountComponent = (vnode, container) => {
	const instance = createComponentInstance(vnode)
	setupComponent(instance)
	setupRenderEffect(instance, container)
}

const setupRenderEffect = (instance, container) => {
	// 虚拟节点树
	const subTree = instance.render()

// vnode -> patch
	patch(subTree, container)
}

export {
	render,
	patch,
	processComponent,
	mountComponent
}
