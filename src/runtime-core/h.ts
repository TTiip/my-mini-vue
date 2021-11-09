import { createNode } from './vnode'

const h = (type, props?, children?) => {
	const vnode = createNode(type, props, children)
	return vnode
}

export {
	h
}
