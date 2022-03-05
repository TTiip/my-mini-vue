const createVNode = (type, props?, children?) => {
	return {
		type,
		props,
		children
	}
}

export {
	createVNode
}