import { effect } from '../reactivity/effect'
import { ShapeFlags } from '../shared/ShapeFlags'
import { EMPTY_OBJ, getSequence } from '../shared'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text  } from './vnode'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { queueJobs } from './scheduler'

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
	const processComponent = (n1, n2, container, parentComponent, anchor) => {
		if (!n1) {
			mountComponent(n2, container, parentComponent, anchor)
		} else {
			updateComponent(n1, n2)
		}
	}

	const updateComponent = (n1, n2) => {
		const instance = n2.component = n1.component
		// 如果 props 完全相同 则不需要更新
		if (shouldUpdateComponent(n1, n2)) {
			instance.next = n2
			instance.update()
		} else {
      n2.el = n1.el
      n2.vnode = n2
    }
	}

	const mountComponent = (initinalVNode, container, parentComponent, anchor) => {
		const instance = initinalVNode.component = createComponentInstance(initinalVNode, parentComponent)

		setupComponent(instance)
		setupRenderEffect(instance, initinalVNode, container, anchor)
	}

	const mountChildren = (children, container, parentComponent, anchor) => {
		// 遍历 children 拿到节点 再次调用patch
		children.map(childrenItem => {
			patch(null, childrenItem, container, parentComponent, anchor)
		})
	}

	// Element
	const processElement = (n1, n2, container, parentComponent, anchor) => {
		if (!n1) {
			mountElement(n2, container, parentComponent, anchor)
		} else {
			patchElement(n1, n2, parentComponent, anchor)
		}
	}

	const patchElement = (n1, n2, parentComponent, anchor) => {
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
		patchChildren(n1, n2, el, parentComponent, anchor)
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

	const patchChildren = (n1, n2, container, parentComponent, anchor) => {
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
				mountChildren(nextChildren, container, parentComponent, anchor)
			} else {
				// 老的是 array 新的也是 array
				patchKeyedChildren(prevChildren, nextChildren, container, parentComponent, anchor)
			}
		}
	}

	const patchKeyedChildren = (c1, c2, container, parentComponent, parentAnchor) => {
		let i = 0
		let l2 = c2.length
		let e1 = c1.length - 1
		let e2 = l2 - 1
		// i 标识双端对比的相同部分的下标
		// e1 e2 分别表示 原数据 和现数据 末尾端 的下标

		// ------> 左侧对比
		while (i <= e1 && i <= e2) {
			const n1 = c1[i]
			const n2 = c2[i]
			if (isSameVNodeType(n1, n2)) {
				patch(n1, n2, container, parentComponent, parentAnchor)
			} else {
				break
			}
			// 相等的时候 每次移动指针 i
			i++
		}

		// ------> 右侧对比
		while (i <= e1 && i <= e2) {
			const n1 = c1[e1]
			const n2 = c2[e2]
			if (isSameVNodeType(n1, n2)) {
				patch(n1, n2, container, parentComponent, parentAnchor)
			} else {
				break
			}
			e1--
			e2--
		}

		if (i > e1) {
			// 新的比老的多 需要创建
			// 左侧右侧 都有效果
			if (i <= e2) {
				const nextPos = e2 + 1
				// const anchor = e2 + 1 >= l2 ? null : c2[nextPos].el
				const anchor = e2 + 1 < l2 ? c2[nextPos].el : null
				while (i <= e2) {
					patch(null, c2[i], container, parentComponent, anchor)
					// 一定记得移动 指针 否则会死循环。
					i++
				}
			}
		} else if (i > e2) {
			// 新的比老的少 需要删除
			// 左侧右侧 都有效果
			while (i <= e1) {
				// remove
				hostRemove(c1[i].el)
				i++
			}
		} else {
			// 乱序部分 中间对比
			let s1 = i
			let s2 = i
			// a,b,(c,e,d),f,g
			// a,b,(e,c),f,g
			// 设定一个值来判断是不是所有的 新数据 中的 数据都比较完了，用来剔除就数据比新数据多，即（去掉这里的 d）。

			// 此处是索引需要 +1
			const toBePatched = e2 - s2 + 1
			let patched = 0
			// 是否需要移动
			let moved = false
			let maxNewIndexSoFar = 0
			// 建立一个 key 映射表
			const keyToNewIndexMap = new Map()
			// 最长递增子序列
			const newIndexToOldIndexMap = new Array(toBePatched)
			for (let i = 0; i < toBePatched; i++) {
				newIndexToOldIndexMap[i] = 0
			}

			for (let i = s2; i <= e2; i++) {
				const nextChild = c2[i]
				keyToNewIndexMap.set(nextChild.key, i)
			}

			let newIndex
			for (let i = s1; i <= e1; i++) {
				const prevChild = c1[i]
				// 如果 所有新的不同节点都已经 patch 完毕
				if (patched >= toBePatched) {
					hostRemove(prevChild.el)
					continue
				}

				// 如果用户设置了 key 值
				if (prevChild.key != null) {
					newIndex = keyToNewIndexMap.get(prevChild.key)
				} else {
					for (let j = s2; j <= e2; j++) {
						if (isSameVNodeType(prevChild, c2[j])) {
							// 如果存在表示找到的原来的节点对应的映射，直接跳出
							newIndex = j
							break
						}
					}
				}
				//
				if (newIndex === undefined) {
					hostRemove(prevChild.el)
				} else {
					if (newIndex >= maxNewIndexSoFar) {
						maxNewIndexSoFar = newIndex
					} else {
						moved = true
					}
					newIndexToOldIndexMap[newIndex - s2] = i + 1
					patch(prevChild, c2[newIndex], container, parentComponent, null)
					patched++
				}
			}

			const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
			let j = increasingNewIndexSequence.length - 1

			for (let i = toBePatched - 1; i >= 0; i--) {
				const nextIndex = i + s2
				const nextChild = c2[nextIndex]
				const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

				if (newIndexToOldIndexMap[i] === 0) {
					patch(null, nextChild, container, parentComponent, anchor)
				} else if (moved) {
					if (j < 0 || i !== increasingNewIndexSequence[j]) {
						console.log('移动位置')
						hostInsert(nextChild.el, container, anchor)
					} else {
						j--
					}
				}
			}
		}
	}

	const isSameVNodeType = (n1, n2) => {
		// type key 两个东西去判断是不是想等
		return n1.type === n2.type && n1.key === n2.key
	}

	const unmountChildren = (children) => {
		children.map(item => {
			const el = item.el
			// remove
			hostRemove(el)
		})
	}

	const mountElement = (vnode, container, parentComponent, anchor) => {
		// vnode --> element 类型的 --> div
		const el = vnode.el = hostCreateElement(vnode.type)

		// children 可能是 string  array
		const { children, props, shapeFlag } = vnode
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			// children
			el.textContent = children
		} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			mountChildren(vnode.children, el, parentComponent, anchor)
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
		hostInsert(el, container, anchor)
	}

	//  Fragment
	const processFragment = (n1, n2, container, parentComponent, anchor) => {
		mountChildren(n2.children, container, parentComponent, anchor)
	}

	// Text
	const processText = (n1, n2, container) => {
		const { children } = n2
		const textNode = n2.el = document.createTextNode(children)
		container.append(textNode)
	}

	const render = (vnode, container) => {
		patch(null, vnode, container, null, null)
	}

	const patch = (n1, n2, container, parentComponent, anchor) => {
		// 判断一下 vnode 类型
		// 调用对应的方法去处理
		const { type, shapeFlag } = n2
		switch (type) {
			case Fragment:
				processFragment(n1, n2, container, parentComponent, anchor)
				break
			case Text:
				processText(n1, n2, container)
				break
			default:
				if (shapeFlag & ShapeFlags.ELEMENT) {
					processElement(n1, n2, container, parentComponent, anchor)
				} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
					processComponent(n1, n2, container, parentComponent, anchor)
				}
				break
		}
	}

	const setupRenderEffect = (instance, initinalVNode, container, anchor) => {
		// 利用 effect 做依赖收集
		instance.update = effect(() => {
			if (!instance.insMounted) {
				const { proxy } = instance
				// 这里传递的 第一个 proxy 是组件实例this，第二个 proxy 是当做组件的参数，方便 render 函数中调用 ctx.xxx
				// 这里是方便组件内部调用 获取 ctx 的操作
				// 后续可能还有很多参数 (_cache, $props, $setup, $data, $options)
				const subTree = instance.subTree = instance.render.call(proxy, proxy)

				// vnode --> patch
				// vnode --> element --> mount
				patch(null, subTree, container, instance, anchor)

				initinalVNode.el = subTree.el
				instance.insMounted = true
			} else {
				// 这里 在更新的时候还需要更新组件的 props
				// 需要 更新完成以后的 vnode

				// vnode: 更新之前的 虚拟节点
				// next: 下次要更新的 虚拟节点
				const { next, vnode } = instance

				if (next) {
					// 更新 el
					next.el = vnode.el

					updateComponentPreRender(instance, next)
				}

				const { proxy } = instance
				const prevSubTree = instance.subTree
				// 这里传递的 第一个 proxy 是组件实例this，第二个 proxy 是当做组件的参数，方便 render 函数中调用 ctx.xxx
				// 这里是方便组件内部调用 获取 ctx 的操作
				// 后续可能还有很多参数 (_cache, $props, $setup, $data, $options)
				const subTree = instance.subTree = instance.render.call(proxy, proxy)

				// vnode --> patch
				// vnode --> element --> mount
				patch(prevSubTree, subTree, container, instance, anchor)

				initinalVNode.el = subTree.el
				instance.insMounted = true
			}
		}, {
			// 优化 不需要每次更新数据都去执行 effect 收集的依赖。
			scheduler: () => {
				// 建立一个 微任务去 等待数据完成在执行回调。
				queueJobs(instance.update)
			}
		})
	}

	return {
		createApp: createAppAPI(render)
	}
}

const updateComponentPreRender = (instance, nextVNode) => {
	instance.vnode = nextVNode
	instance.next = null
	instance.props = nextVNode.props
}

export {
	createRender
}
