import { NodeTypes, createVNodeCall } from '../ast'

const transformElement = (node, context) => {
	return () => {
		if (node.type === NodeTypes.ELEMENT) {
			// 以下中间处理层，处理一下数据～

			// tag
			const vnodeTag = `'${node.tag}'`

			// props
			let vnodeProps

			let vnodeChild = node.children[0]

			node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChild)
		}
	}
}

export {
	transformElement
}
