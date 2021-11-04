import { createNode } from './vnode'
import { render } from './render'

const createApp = (rootComponent) => {
	return {
		mount: (rootContainer) => {
			// 先VNode
			// 所有逻辑操作 都会基于 VNode 做操作
			const vnode = createNode(rootComponent)
			// 渲染
			render(vnode, rootContainer)
		}
	}
}

export {
	createApp
}
