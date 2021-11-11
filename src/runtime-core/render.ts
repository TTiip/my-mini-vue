import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'

const render = (vnode, container) => {
	//  patch -> 方便数据的处理
	patch(vnode, container)
}

const patch = (vnode, container) => {
	// 去处理组件

	// 判断 是不是 element
	// 如果是 element 那么应该处理 element
	// 如果是 component 就处理 component
	const { shapeFlag } = vnode
	if (shapeFlag & ShapeFlags.ELEMENT) {
		processElement(vnode, container)
	} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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
	const { type, children, props, shapeFlag } = vnode
	// 此处的 虚拟节点 是数据 element 类型
	const el = (vnode.el = document.createElement(type))
	// 内容 string 或者 array
	if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
		el.textContent = children
	} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
		mountChildren(vnode, el)
	}
	// 处理 props
	for (const key in props) {
		const val = props[key]
		// 事件 onClick --> 具体 --> 通用
		// on + event name

		// 匹配是否是事件
		const isOn = (key) => /^on[A-Z]/.test(key)
		if (isOn(key)) {
			// 去掉 事件名前面的 on
			const event = key.slice(2).toLowerCase()
			el.addEventListener(event, props[key])
		} else if ((key === 'class' || key === 'id') && Array.isArray(props[key])) {
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
	setupRenderEffect(instance, vnode, container)
}

const setupRenderEffect = (instance, vnode, container) => {
	const { proxy } = instance

	// 虚拟节点树
	// 通过call方法 改变this指向为proxy，在使用代理获取对应的值
	const subTree = instance.render.call(proxy)

// vnode -> patch
	patch(subTree, container)

	// element --> mount
	// 在 element 子节点 全部处理完成以后
	vnode.el = subTree.el
}

export {
	render,
	patch,
	processElement,
	processComponent,
	mountComponent
}
