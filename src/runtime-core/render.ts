import { createComponentInstance, setupComponent } from './component'

const render = (vnode, container) => {
	//  patch -> 方便数据的处理
	patch(vnode, container)
}

const patch = (vnode, container) => {
	// 去处理组件

	// 判断 是不是 element
	// 如果是 element 那么应该处理 element
	// 如果是 component 就处理 component
	if (typeof vnode.type === 'string') {
		processElement(vnode, container)
	} else if (typeof vnode.type === 'object') {
		processComponent(vnode, container)
	}
}

const processElement = (vnode, container) => {
	mountElemnt(vnode, container)
}

const processComponent = (vnode, container) => {
	mountComponent(vnode, container)
}

const mountElemnt = (vnode, container) => {
	const { type, children, props } = vnode
	const el = document.createElement(type)
	// 内容 string 或者 array
	if (typeof children === 'string') {
		el.textContent = children
	} else if (Array.isArray(children)) {
		mountChildren(vnode, el)
	}
	// 处理 props
	for (const key in props) {
		const val = props[key]
		if ((key === 'class' || key === 'id') && Array.isArray(props[key])) {
			// 如果是 calss、id 且是一个 class、id 数组 则循环调用 添加class
			el.setAttribute(key, val.join(' '))
		} else {
			// 除去 class 和 id 且都是数据的情况 其他属性 直接赋值。
			el.setAttribute(key, val)
		}
	}
	container.append(el)
}

const mountChildren = (vnode, container) => {
	vnode.children.map(item => {
		patch(item, container)
	})
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
	processElement,
	processComponent,
	mountComponent
}
