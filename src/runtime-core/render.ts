import { isObject } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'

// Component
const processComponent = (vnode, container) => {
  mountComponent(vnode, container)
}

const mountComponent = (vnode, container) => {
  const instance = createComponentInstance(vnode,)

	setupComponent(instance)
	setupRenderEffect(instance, container)
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
	const el = document.createElement(vnode.type)

	// children 可能是 string  array
	const { children, props } = vnode
	if (typeof children === 'string') {
		// children
		el.textContent = children
	} else if (Array.isArray(children)) {
		mountChildren(children, el)
	}

	// props
	for (const key in props) {
		let val
		if (Array.isArray(props[key])) {
			val = props[key].join(' ')
		} else {
			val = props[key]
		}
		el.setAttribute(key, val)
	}
	// 挂载在页面上
	container.append(el)
}
const render = (vnode, container) => {
  // patch
  patch(vnode, container)
}

const patch = (vnode, container) => {
  // 去处理我们的组件

	// TODO 判断一下 vnode 是不是 element 类型
	// 调用对应的方法去处理对应的 方法

	// processElement()
	if (typeof vnode.type === 'string') {
		processElement(vnode, container)
	} else if (isObject(vnode.type)) {
		processComponent(vnode, container)
	}
}

const setupRenderEffect = (instance, container) => {
	const subTree = instance.render()

	// vnode --> patch
	// vnode --> element --> mount
	patch(subTree, container)

}

export {
	render
}
