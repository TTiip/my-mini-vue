import { effect } from '../reactivity/effect'
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
	const processComponent = (n1, n2, container, parentComponent) => {
		mountComponent(n2, container, parentComponent)
	}

	const mountComponent = (initinalVNode, container, parentComponent) => {
		const instance = createComponentInstance(initinalVNode, parentComponent)

		setupComponent(instance)
		setupRenderEffect(instance, initinalVNode, container)
	}

	const mountChildren = (vnode, container, parentComponent) => {
		// 遍历 children 拿到节点 再次调用patch
		vnode.children.map(childrenItem => {
			patch(null, childrenItem, container, parentComponent)
		})
	}

	// Element
	const processElement = (n1, n2, container, parentComponent) => {
		if (!n1) {
			mountElement(n2, container, parentComponent)
		} else {
			patchElement(n1, n2, container)
		}
	}

	const patchElement = (n1, n2, container) => {
		console.log('patchElement')
		console.log('n1', n1)
		console.log('n2', n2)
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
	const processFragment = (n1, n2, container, parentComponent) => {
		mountChildren(n2, container, parentComponent)
	}

	// Text
	const processText = (n1, n2, container) => {
		const { children } = n2
		const textNode = n2.el = document.createTextNode(children)
		container.append(textNode)
	}

	const render = (vnode, container) => {
		patch(null, vnode, container, null)
	}

	const patch = (n1, n2, container, parentComponent) => {
		// 判断一下 vnode 类型
		// 调用对应的方法去处理
		const { type, shapeFlag } = n2
		switch (type) {
			case Fragment:
				processFragment(n1, n2, container, parentComponent)
				break
			case Text:
				processText(n1, n2, container)
				break
			default:
				if (shapeFlag & ShapeFlags.ELEMENT) {
					processElement(n1, n2, container, parentComponent)
				} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
					processComponent(n1, n2, container, parentComponent)
				}
				break
		}
	}

	const setupRenderEffect = (instance, initinalVNode, container) => {
		// 利用 effect 做依赖收集
		effect(() => {
			if (!instance.insMounted) {
				console.log('init')
				const { proxy } = instance
				const subTree = instance.subTree = instance.render.call(proxy)

				// vnode --> patch
				// vnode --> element --> mount
				patch(null, subTree, container, instance)

				initinalVNode.el = subTree.el
				instance.insMounted = true
			} else {
				console.log('update')
				const { proxy } = instance
				const prevSubTree = instance.subTree
				const subTree = instance.subTree = instance.render.call(proxy)

				// vnode --> patch
				// vnode --> element --> mount
				patch(prevSubTree, subTree, container, instance)

				initinalVNode.el = subTree.el
				instance.insMounted = true
			}
		})
	}

	return {
		createApp: createAppAPI(render)
	}
}

export {
	createRender
}
