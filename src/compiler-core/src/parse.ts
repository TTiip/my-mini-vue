
import { NodeTypes } from './ast'

const interpolationOpenDelimiter = '{{'
const interpolationCloseDelimiter = '}}'

const ElementCloseDelimiter = '<'

const enum TagType {
	Start,
	End
}

const baseParse = (content: string) => {
	const context = createparserContent(content)
	// 初始化的时候 标签数组 传递一个 []
	return createRoot(parserChildren(context, []))
}

const parserChildren = (context: { source: string }, ancestors) => {
	const nodes: any = []
	// 循环解析 字符串。
	while (!isEnd(context, ancestors)) {
		let node
		const source = context.source

		// 字符串是以 {{ 开头的才需要处理
		if (source.startsWith(interpolationOpenDelimiter)) {
			// 插值
			node = parseInterpolation(context)
		} else if (source.startsWith(ElementCloseDelimiter)) { // source[0] === '<'
			// element
			if (/[a-z]/i.test(source[1])) {
				node = parserElement(context, ancestors)
			}
		}

		// 如果前面的的两个判断都没有命中，表示是文本。
		if (!node) {
			node = parseText(context)
		}
		nodes.push(node)
	}

	return nodes
}

const isEnd = (context, ancestors) => {
	// 1.当遇到结束标签的时候
	const source = context.source
	if (source.startsWith('</')) {
		for (let i = ancestors.length - 1; i >= 0; i--) {
			const tag = ancestors[i].tag
			if (startWithEndTagOpen(source, tag)) {
				return true
			}
		}
	}

	// 2.context.source 有值的时候
	return !context.source
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
	const closeIndex = context.source.indexOf(interpolationCloseDelimiter, interpolationOpenDelimiter.length)
	// 去掉 前面的 '{{'
	advanceBy(context, interpolationCloseDelimiter.length)

	const rawContentLength = closeIndex - interpolationOpenDelimiter.length
	// 可能存在空格 trim去掉~
	// const rawContent = context.source.slice(0, rawContentLength)
	const rawContent = parseTextData(context, rawContentLength)
	const content = rawContent.trim()

	advanceBy(context, interpolationCloseDelimiter.length)

	//
	// TODO 思考 上面的逻辑 可以使用 slice(2, -2) 来直接获取吗？
	// context.source = context.source.slice(2, -2)
	// const content = context.source.slice(interpolationOpenDelimiter.length, -interpolationCloseDelimiter.length).trim()

	return {
		type: NodeTypes.INTERPOLATION,
		content: {
			type: NodeTypes.SIMPLE_EXPRESSION,
			content
		}
	}
}

// element
// 在调用 parserElement 的时候，使用栈的 先进后出特性，把 element push进去
// 之后在完成解析以后取出，比较标签有没有闭合。
const parserElement = (context, ancestors) => {
	// 这里需要调用两次！！！切记 开始标签匹配一次
	const element: any = parserTag(context, TagType.Start)

	ancestors.push(element)

	element.children = parserChildren(context, ancestors)

	ancestors.pop()
	// 这里需要判断标签是不是匹配，如果匹配才能销毁，或者删掉。
	if (startWithEndTagOpen(context.source, element.tag)) {
		// 结束标签匹配一次！！！
		parserTag(context, TagType.End)
	} else {
		throw new Error(`缺少结束标签: ${element.tag}`)
	}

	return element
}

const startWithEndTagOpen = (source, tag) => {
	return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
}

const parserTag = (context, type: TagType) => {
	// 1.解析 tag
	// <div />
	// <div></div>
	// 匹配以 < 开头或者以 </ 开头的 字符，/ 可以没有。
	const match: any = /^<\/?([a-z]*)/i.exec(context.source)
	const tag = match[1]

	// 2.删除处理完成的代码
	advanceBy(context, match[0].length)
	advanceBy(context, 1)
	if (type === TagType.End) {
		// 如果是结束标签 (</div>) 直接不用返回 后面的东西了。
		return
	}

	return {
		type: NodeTypes.ELEMENT,
		tag
	}
}

// text 文本类型
const parseText = (context) => {
	let endTokens = ['{{', '<']
	let endIndex = context.source.length
	// 遇到 {{ 或者 < 都应该直接停下，返回了
	for (let i = 0; i < endTokens.length; i++) {
		const index = context.source.indexOf(endTokens[i])
		// 当 字符串中 存在 {{ 表示是文本和 插值混合的。
		if (index !== -1 && endIndex > index) {
			endIndex = index
		}
	}

	// 1. 获取content
  const content = parseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content
  }
}

const parseTextData = (context: any, length) => {
  const content = context.source.slice(0, length)

  // 2. 推进
  advanceBy(context, length)

  return content
}

export {
	baseParse
}

