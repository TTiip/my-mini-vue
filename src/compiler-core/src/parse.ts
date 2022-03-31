
import { NodeTypes } from './ast'

const openDelimiter = '{{'
const closeDelimiter = '}}'

const baseParse = (content: string) => {
	const context = createparserContent(content)
	return createRoot(parserChildren(context))
}

const parserChildren = (context: { source: string }) => {
	const nodes: any = []
	let node

	// 字符串是以 {{ 开头的才需要处理
	if (context.source.startsWith(openDelimiter)) {
		node = parseInterpolation(context)
	}
	nodes.push(node)

	return nodes
}

const createRoot = (children) => {
	return {
		children
	}
}

const createparserContent = (content: string) => {
	return {
		source: content
	}
}
const advanceBy = (context, length) => {
	context.source = context.source.slice(length)
}

const parseInterpolation = (context) => {
	// {{ message }} ---> 拿到这个 message

	// 从第二个字符位置开始查找， 到 '}}' 结束
	const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
	// 去掉 前面的 '{{'
	advanceBy(context, closeDelimiter.length)

	const rawContentLength = closeIndex - openDelimiter.length
	// 可能存在空格 trim去掉~
	const rawContent = context.source.slice(0, rawContentLength)
	const content = rawContent.trim()

	advanceBy(context, rawContentLength + closeDelimiter.length)

	//
	// TODO 思考 上面的逻辑 可以使用 slice(2, -2) 来直接获取吗？
	// context.source = context.source.slice(2, -2)
	// const content = context.source.slice(openDelimiter.length, -closeDelimiter.length).trim()

	console.log(content, 'content')
	console.log(context.source, 'context.source')

	return {
		type: NodeTypes.INTERPOLATION,
		content: {
			type: NodeTypes.SIMPLE_EXPRESSION,
			content: content
		}
	}
}

export {
	baseParse
}

