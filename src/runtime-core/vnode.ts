import { ShapeFlags } from '../shared/ShapeFlags'

const createNode = (type, props?, children?) => {
	const vnode = {
		type,
		props,
		children,
		shapeFlag: getShapeFlag(type),
		el: null
	}

	if (typeof children === 'string') {
		vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
	} else if (Array.isArray(children)) {
		vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
	} else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
		// 组件 + children 必须是 object
		if (typeof children === 'object') {
			vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
		}
	}
	return vnode
}

const getShapeFlag = (type) => {
	return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}

export {
	createNode,
	getShapeFlag
}
