import { isString } from '../../shared'
import { NodeTypes } from './ast'
import { helperMapName, TO_DISPLAY_STRING, CREATE_ELEMENT_VNODE } from './runtimeHelpers'

const generate = (ast) => {
	const context: any = createCodegenContext()
	const { push } = context

	genFunctionPreamble(ast, context)

	push('return ')

	const functionName = 'render'
	const args = ['_ctx', '_cache', '$props', '$setup', '$data', '$options']
	const signature = args.join(', ')

	push(`function ${functionName} (${signature}) { `)
	push('return ')
	genNode(ast.codegenNode, context)
	push(' }')

	return {
    code: context.code
  }
}

const genNodeList = (nodes, context) => {
	const { push } = context

	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i]
		if (isString(node)) {
			push(node)
		} else {
			genNode(node, context)
		}
		if (i < nodes.length - 1) {
			push(', ')
		}
	}
}

const genNode = (node, context) => {
	// 获取 ast的入口，在外部处理内容。
	// 区分一下类型
	switch (node.type) {
		case NodeTypes.TEXT:
			genText(node, context)
			break
		case NodeTypes.INTERPOLATION:
			genInterpolation(node, context)
			break
		case NodeTypes.SIMPLE_EXPRESSION:
			genExpression(node, context)
			break
		case NodeTypes.ELEMENT:
			genElement(node, context)
			break
		case NodeTypes.COMPOUND_EXPRESSION:
			genCompoundExpression(node, context)
			break

		default:
			break
	}
}

const createCodegenContext = () => {
	const context = {
		code: '',
		push(source) {
			context.code += source
		},
		getHelperName (key) {
			return `_${helperMapName[key]}`
		}
	}
	return context
}

const genFunctionPreamble = (ast: any, context: any) => {
	const { push } = context
	const VueBinging = 'vue'

	const aliasHelpers = (s: string) => `${helperMapName[s]}: _${helperMapName[s]}`

	if (ast.helpers.length > 0) {
		push(`const { ${ast.helpers.map(aliasHelpers).join(', ')} } = '${VueBinging}'`)
	}
	push('\n')
}

const genText = (node: any, context: any) => {
	const { push } = context
	push(`'${node.content}'`)
}

const genInterpolation = (node: any, context: any) => {
	const { push, getHelperName } = context
	push(`${getHelperName(TO_DISPLAY_STRING)}(`)
	genNode(node.content, context)
	push(`)`)
}

const genExpression = (node: any, context: any) => {
	const { push } = context
	push(node.content)
}

const genElement = (node: any, context: any) => {
	const { push, getHelperName } = context
	const { tag, children, props } = node

	push(`${getHelperName(CREATE_ELEMENT_VNODE)}(`)
	genNodeList(getNullAble([tag, props, children]), context)
	// genNode(children, context)
	// push(')')
}

const genCompoundExpression = (node: any, context: any) => {
	const { push } = context
	const { children } = node

	for (let i = 0; i < children.length; i++) {
		const child = children[i]
		if (isString(child)) {
			push(child)
		} else {
			genNode(child, context)
		}
	}

	push(')')
}

const getNullAble = (arg) => {
	return arg.map(item => item || 'null')
}

export {
	generate
}

