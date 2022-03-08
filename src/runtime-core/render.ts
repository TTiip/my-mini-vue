import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text  } from './vnode'

// custom render
const createRender = (options) => {
	const {
		createElement: hostCreateElement,
		patchProp: hostPatchProp,
		insert: hostInsert
	} = options

	// Component
	const processComponent = (vnode, container, parentComponent) => {
		mountComponent(vnode, container, parentComponent)
	}

	const mountComponent = (initinalVNode, container, parentComponent) => {
		const instance = createComponentInstance(initinalVNode, parentComponent)

		setupComponent(instance)
		setupRenderEffect(instance, initinalVNode, container)
	}

	const mountChildren = (vnode, container, parentComponent) => {
		// 遍历 children 拿到节点 再次调用patch
		vnode.children.map(childrenItem => {
			patch(childrenItem, container, parentComponent)
		})
	}

	// Element
	const processElement = (vnode, container, parentComponent) => {
		mountElement(vnode, container, parentComponent)
	}

	const mountElement = (vnode, container, parentComponent) => {
		// vnode --> element 类型的 --> div
		const el = vnode.el = hostCreateElement(vnode.type)

		// children 可能是 string  array
		const { children, props, shapeFlag } = vnode
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			// children
			el.textContent = children
		} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			mountChildren(vnode, el, parentComponent)
		}

		// props
		for (const key in props) {
			let val
			if (Array.isArray(props[key])) {
				val = props[key].join(' ')
			} else {
				val = props[key]
			}
			hostPatchProp(el, key, val)
		}

		// 挂载在页面上
		hostInsert(el, container)
	}

	//  Fragment
	const processFragment = (vnode, container, parentComponent) => {
		mountChildren(vnode, container, parentComponent)
	}

	// Text
	const processText = (vnode, container) => {
		const { children } = vnode
		const textNode = vnode.el = document.createTextNode(children)
		container.append(textNode)
	}

	const render = (vnode, container) => {
		patch(vnode, container, null)
	}

	const patch = (vnode, container, parentComponent) => {
		// 判断一下 vnode 类型
		// 调用对应的方法去处理
		const { type, shapeFlag } = vnode
		switch (type) {
			case Fragment:
				processFragment(vnode, container, parentComponent)
				break
			case Text:
				processText(vnode, container)
				break
			default:
				if (shapeFlag & ShapeFlags.ELEMENT) {
					processElement(vnode, container, parentComponent)
				} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
					processComponent(vnode, container, parentComponent)
				}
				break
		}
	}

	const setupRenderEffect = (instance, initinalVNode, container) => {
		const { proxy } = instance
		const subTree = instance.render.call(proxy)

		// vnode --> patch
		// vnode --> element --> mount
		patch(subTree, container, instance)

		initinalVNode.el = subTree.el
	}

	return {
		createApp: createAppAPI(render)
	}
}

export {
	createRender
}
