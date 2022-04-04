import { NodeTypes } from '../ast'

const transformExpression = (node) => {
	if (node.type === NodeTypes.INTERPOLATION) {
		processExpression(node.content)
	}
}

const processExpression = (node) => {
	node.content = `_ctx.${node.content}`
}

export {
	transformExpression
}
