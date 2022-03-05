import { createVNode } from './vnode'

const h = (type, props?, children?) => {
	return createVNode(type, props, children)
}

export {
	h
}