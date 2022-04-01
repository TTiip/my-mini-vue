const generate = (ast) => {
	const context: any = createCodegenContext()
	const { push } = context

	push('return ')

	const functionName = 'render'
	const args = ['_ctx', '_cache', '$props', '$setup', '$data', '$options']
	const signature = args.join(', ')

	push(`function ${functionName} (${signature}) { `)
	push('return ')
	genNode(ast, context)
	push(' }')

	return {
    code: context.code
  }
}

const genNode = (ast, context) => {
	// 获取 ast的入口，在外部处理内容。
	const node = ast.codegenNode
	const { push } = context
	push(`'${node.content}'`)
}

const createCodegenContext = () => {
	const context = {
		code: '',
		push(source) {
			context.code += source
		}
	}
	return context
}

export {
	generate
}
