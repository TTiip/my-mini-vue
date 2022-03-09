import { effect } from '../reactivity/effect'
import { ShapeFlags } from '../shared/ShapeFlags'
import { EMPTY_OBJ } from '../shared'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text  } from './vnode'

// custom render
const createRender = (options) => {
	const {
		createElement: hostCreateElement,
		patchProp: hostPatchProp,
		insert: hostInsert,
		remove: hostRemove,
		setElementText: hostSetElementText,
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

	const mountChildren = (children, container, parentComponent) => {
		// 遍历 children 拿到节点 再次调用patch
		children.map(childrenItem => {
			patch(null, childrenItem, container, parentComponent)
		})
	}

	// Element
	const processElement = (n1, n2, container, parentComponent) => {
		if (!n1) {
			mountElement(n2, container, parentComponent)
		} else {
			patchElement(n1, n2, parentComponent)
		}
	}

	const patchElement = (n1, n2, parentComponent) => {
		// console.log('patchElement')
		// console.log('n1', n1)
		// console.log('n2', n2)
		// props 修改 有以下几种情况：
		// 1.之前属性的值和现在的值不一样了          --> 修改
		// 2.之前属性的值变成 undefined 或者 null  --> 删除
		// 3.之前属性的值 现在没有了               --> 删除

		const oldProps = n1.props || EMPTY_OBJ
		const newProps = n2.props || EMPTY_OBJ
		// 当 第二次 patchElement 时 第一次的 n2 应该当作 第二次的 n1 去使用
		// 但是 n2 上并不存在 el 所以此处应当赋值以便于第二次调用。
		const el = n2.el = n1.el
		patchProps(el, oldProps, newProps)

		// children 修改有以下几种情况
		// text --> text
		// text --> array
		// array --> array
		// array --> text
		patchChildren(n1, n2, el, parentComponent)
	}

	const patchProps = (el, oldProps, newProps) => {
		if (oldProps !== newProps) {
			for (const key in newProps) {
				const prevProp = oldProps[key]
				const nextProp = newProps[key]
				if (prevProp !== nextProp) {
					// 不相等的时候更新
					hostPatchProp(el, key, prevProp, nextProp)
				}
			}

			// 不等与空对象 才会去对比
			// 不能直接 rops !== {} 这个相当于创建了一个新的内存地址 所以这个判断一定是 true
			if (oldProps !== EMPTY_OBJ) {
				// 如果新设置的props 在原来的 props中不存在 则直接删除掉。
				for (const key in oldProps) {
					const prevProp = oldProps[key]
					if (!(key in newProps )) {
						hostPatchProp(el, key, prevProp, null)
					}
				}
			}
		}
	}

	const patchChildren = (n1, n2, container, parentComponent) => {
		const prevShapeFlag = n1.shapeFlag
		const nextShapeFlag = n2.shapeFlag
		const prevChildren = n1.children
		const nextChildren = n2.children

		if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
			if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
				// 老的是 array & 新的是 text
				// 1.把老的 children 清空
				unmountChildren(n1.children)
				// 2.设置 text
				// hostSetElementText(container, nextChildren)
			}
			// 老的是 text & 新的是 text
			if (prevChildren !== nextChildren) {
				hostSetElementText(container, nextChildren)
			}
		} else {
			// 老的是 array & 新的是 text
			if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
				// 1.把老的 text 清空
				hostSetElementText(container, '')
				mountChildren(nextChildren, container, parentComponent)
			}
		}
	}

	const unmountChildren = (children) => {
		children.map(item => {
			const el = item.el
			// remove
			hostRemove(el)
		})
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
			mountChildren(vnode.children, el, parentComponent)
		}

		// props
		for (const key in props) {
			let val
			if (Array.isArray(props[key])) {
				val = props[key].join(' ')
			} else {
				val = props[key]
			}
			hostPatchProp(el, key, null, val)
		}

		// 挂载在页面上
		hostInsert(el, container)
	}

	//  Fragment
	const processFragment = (n1, n2, container, parentComponent) => {
		mountChildren(n2.children, container, parentComponent)
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
				const { proxy } = instance
				const subTree = instance.subTree = instance.render.call(proxy)

				// vnode --> patch
				// vnode --> element --> mount
				patch(null, subTree, container, instance)

				initinalVNode.el = subTree.el
				instance.insMounted = true
			} else {
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
