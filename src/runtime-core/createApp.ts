import { createNode } from './vnode'
import { getShapeFlag } from './vnode'
import { ShapeFlags } from '../shared/ShapeFlags'

const createAppAPI = (render) => {
	const createApp = (rootComponent) => {
		return {
			mount: (rootContainer) => {
				// 先 转换成 VNode
				// component --> vNode
				// 所有逻辑操作 都会基于 VNode 做操作
				const vnode = createNode(rootComponent)
				// 渲染
				// 判断传入的是 字符串 即为 id或者class 获取dom以后在传入。
				// 如果传入的是 组件对象 则 直接传入调用。
				if (getShapeFlag(rootContainer) & ShapeFlags.ELEMENT) {
					const renderContain = document.querySelector(rootContainer)
					render(vnode, renderContain)
				} else if (getShapeFlag(rootContainer) & ShapeFlags.STATEFUL_COMPONENT) {
					render(vnode, rootContainer)
				}
			}
		}
	}
	return createApp
}

export {
	createAppAPI
}

