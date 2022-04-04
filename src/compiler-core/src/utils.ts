import { NodeTypes } from './ast'

const isText = (node) => {
	return (
		node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
	);
}

export {
	isText
}
