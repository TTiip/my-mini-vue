import { getShapeFlag } from '../shared/index'
import { ShapeFlags } from '../shared/ShapeFlags'

const Fragment = Symbol('Fragment')
const Text = Symbol('Text')

const createVNode = (type, props?, children?) => {
	const vnode = {
		type,
		props,
		children,
		component: null,
		key: props && props.key,
		shapeFlag: getShapeFlag(type),
		el: null
	}

	if (typeof children === 'string') {
		// 元素节点
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
		// 组件节点
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

	// 判断是否需要 slots 处理
	// 首先是必须是一个组件类型，其次 children 必须是一个对象
	if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
		if (typeof children === 'object') {
			vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
		}
	}

	return vnode
}

const createTextVNode = (text: string) => {
	return createVNode(Text, {}, text)
}

export {
	createVNode as createElementVNode
}

export {
	createVNode,
	createTextVNode,
	Fragment,
	Text
}
