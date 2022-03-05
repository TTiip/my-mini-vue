const createVNode = (type, props?, children?) => {
	return {
		type,
		props,
		children,
		el: null
	}
}

export {
	createVNode
}