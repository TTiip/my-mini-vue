const transform = (root, options = {}) => {

	const context = createTransformContext(root, options)

	traverseNode(root, context)
	createRootCodegen(root)
}

const createRootCodegen = (root: any) => {
  root.codegenNode = root.children[0]
}

const traverseNode = (node, context) => {

	const nodeTransforms = context.nodeTransforms
	for (let i = 0; i < nodeTransforms.length; i++) {
		const fn = nodeTransforms[i]
		fn(node)
	}
	// 处理children
	traverseChildren(node, context)
}

const createTransformContext = (root, options) => {
	const context = {
		root,
		nodeTransforms: options.nodeTransforms || []
	}
	return context
}

const traverseChildren = (node: any, context: any) => {
	const children = node.children
	if (children) {
		for (let i = 0; i < children.length; i++) {
			const node = children[i]
			traverseNode(node, context)
		}
	}
}

export {
	transform
}

