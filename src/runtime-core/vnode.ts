import { getShapeFlag } from '../shared/index'
import { ShapeFlags } from '../shared/ShapeFlags';

const createVNode = (type, props?, children?) => {
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
  }

	return vnode
}

export {
	createVNode
}