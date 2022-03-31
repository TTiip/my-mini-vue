
import { NodeTypes } from './ast'

const openDelimiter = '{{'
const closeDelimiter = '}}'

const enum TagType {
	Start,
	End
}

const baseParse = (content: string) => {
	const context = createparserContent(content)
	return createRoot(parserChildren(context))
}

const parserChildren = (context: { source: string }) => {
	const nodes: any = []
	let node
	const source = context.source

	// 字符串是以 {{ 开头的才需要处理
	if (source.startsWith(openDelimiter)) {
		// 插值
		node = parseInterpolation(context)
	} else if (source.startsWith('<')) { // source[0] === '<'
		// element
		if (/[a-z]/i.test(source[1])) {
			node = parserElement(context)
		}
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

// 插值
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

	return {
		type: NodeTypes.INTERPOLATION,
		content: {
			type: NodeTypes.SIMPLE_EXPRESSION,
			content
		}
	}
}

// element
const parserElement = (context) => {
	// 这里需要调用两次！！！切记
	const element = parserTag(context, TagType.Start)
	// ！！！
	parserTag(context, TagType.End)

	return element
}

const parserTag = (context, type: TagType) => {
	// 1.解析 tag
	// <div />
	// <div></div>
	// 匹配以 < 开头或者以 </ 开头的 字符，/ 可以没有。
	const match: any = /^<\/?([a-z]*)/i.exec(context.source)
	const tag = match[1]
	console.log(match, 'match')

	// 2.删除处理完成的代码
	advanceBy(context, match[0].length)
	advanceBy(context, 1)
	if (type === TagType.End) {
		// 如果是结束标签直接 后面不用返回 后面的东西了。
		return
	}

	return {
		type: NodeTypes.ELEMENT,
		tag
	}
}

export {
	baseParse
}

