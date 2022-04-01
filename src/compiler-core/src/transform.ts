const transform = (root, options) => {

	const context = createTransformContext(root, options)

	// 1. 遍历 -> 深度优先搜索
	traverseNode(root, context)
	// 2.修改 text content
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

