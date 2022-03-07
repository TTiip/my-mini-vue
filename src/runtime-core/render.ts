import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'

// Component
const processComponent = (vnode, container) => {
  mountComponent(vnode, container)
}

const mountComponent = (initinalVNode, container) => {
  const instance = createComponentInstance(initinalVNode)

	setupComponent(instance)
	setupRenderEffect(instance, initinalVNode, container)
}

const mountChildren = (children, container) => {
	// 便利children 拿到节点 再次调用patch
	children.map(childrenItem => {
		patch(childrenItem, container)
	})
}

// Element
const processElement = (vnode, container) => {
  mountElement(vnode, container)
}

const mountElement = (vnode, container) => {
	// vnode --> element 类型的 --> div
	const el = vnode.el = document.createElement(vnode.type)

	// children 可能是 string  array
	const { children, props, shapeFlag } = vnode
	if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
		// children
		el.textContent = children
	} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
		mountChildren(children, el)
	}

	// props
	for (const key in props) {
		console.log(key, 'key')
		let val
		if (Array.isArray(props[key])) {
			val = props[key].join(' ')
		} else {
			val = props[key]
		}
		// 实现注册 emit 事件
		const isOn = key => /^on[A-Z]/.test(key)
		if (isOn(key)) {
			const eventName = key.slice(2).toLowerCase()
			el.addEventListener(eventName, val)
		} else {
			el.setAttribute(key, val)
		}
	}
	// 挂载在页面上
	container.append(el)
}
const render = (vnode, container) => {
  // patch
  patch(vnode, container)
}

const patch = (vnode, container) => {
	// 判断一下 vnode 类型
	// 调用对应的方法去处理
	const { shapeFlag } = vnode
	if (shapeFlag & ShapeFlags.ELEMENT) {
		processElement(vnode, container)
	} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
		processComponent(vnode, container)
	}
}

const setupRenderEffect = (instance, initinalVNode, container) => {
	const { proxy } = instance
	const subTree = instance.render.call(proxy)

	// vnode --> patch
	// vnode --> element --> mount
	patch(subTree, container)

	initinalVNode.el = subTree.el
}

export {
	render
}
