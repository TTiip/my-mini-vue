import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING } from './runtimeHelpers'

const transform = (root, options = {}) => {

	const context = createTransformContext(root, options)

	traverseNode(root, context)
	createRootCodegen(root)

	root.helpers = [...context.helpers.keys()]
}

const createRootCodegen = (root: any) => {
	const child = root.children[0]

	if (child.type === NodeTypes.ELEMENT) {
		root.codegenNode = child.codegenNode
	} else {
		root.codegenNode = root.children[0]
	}
}

const traverseNode = (node, context) => {
	const nodeTransforms = context.nodeTransforms
	const exitFns: any = []

	for (let i = 0; i < nodeTransforms.length; i++) {
		const transform = nodeTransforms[i]
		const onExit = transform(node, context)
		if (onExit) {
			exitFns.push(onExit)
		}
	}
	// 这里需要 分情况处理不同类型的逻辑
	switch (node.type) {
		// 插值类型
		case NodeTypes.INTERPOLATION:
			context.helper(TO_DISPLAY_STRING)
			break
		// root 根结点
		case NodeTypes.ROOT:
		case NodeTypes.ELEMENT:
			// 处理 children
			traverseChildren(node, context)
			break
		default:
			break
	}

	let i = exitFns.length
	while (i--) {
		exitFns[i]()
	}
}

const createTransformContext = (root, options) => {
	const context = {
		root,
		helpers: new Map(),
		helper(key) {
			context.helpers.set(key, 1)
		},
		nodeTransforms: options.nodeTransforms || []
	}
	return context
}

const traverseChildren = (node: any, context: any) => {
	const children = node.children
	for (let i = 0; i < children.length; i++) {
		const node = children[i]
		traverseNode(node, context)
	}
}

export {
	transform
}

