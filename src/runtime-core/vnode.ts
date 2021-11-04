const createNode = (type, props?, children?) => {
	const vnode = {
		type,
		props,
		children
	}
	return vnode
}

export {
	createNode
}
