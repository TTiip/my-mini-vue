import { NodeTypes } from '../ast'
import { isText } from '../utils'

const transformText = (node) => {
	return () => {
		const { children } = node
		let currentContainer

		if (node.type === NodeTypes.ELEMENT) {
			for (let i = 0; i < children.length; i++) {
				const child = children[i]
				if (isText(child)) {
					for (let j = i + 1; j < children.length; j++) {
						const nextChild = children[j]
						if (isText(nextChild)) {
							if (!currentContainer) {
								currentContainer = children[i] = {
									type: NodeTypes.COMPOUND_EXPRESSION,
									children: [child]
								}
							}
							currentContainer.children.push(' + ')
							currentContainer.children.push(nextChild)
							// 添加完成的 元素需要去掉
							children.splice(j, 1)
							// 删除以后后面的元素前移，导致取错，--即可
							j--
						} else {
							currentContainer = undefined
							break
						}
					}
				}
			}
		}
	}
}

export {
	transformText
}
