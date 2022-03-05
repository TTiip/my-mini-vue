import { createComponentInstance, setupComponent } from './component'

const render = (vnode, container) => {
  // patch
  patch(vnode, container)
}

const patch = (vnode, container) => {
  // 去处理我们的组件

	// TODO 判断一下 vnode 是不是 element 类型
	// 调用对应的方法去处理对应的 方法

	// processElement()

  processComponent(vnode, container)
}

const processComponent = (vnode, container) => {
  mountComponent(vnode, container)
}

const mountComponent = (vnode, container) => {
  const instance = createComponentInstance(vnode,)

	setupComponent(instance)
	setupRenderEffect(instance, container)
}

const setupRenderEffect = (instance, container) => {
	const subTree = instance.render()

	// vnode --> patch
	// vnode --> element --> mount
	patch(subTree, container)

}

export {
	render
}
