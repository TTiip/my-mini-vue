import { createVNode } from './vnode'

const createAppAPI = (render) => {
  const createApp = (rootComponent) => {
    return {
      mount(rootContainer) {
        // 先转换成虚拟节点
        // component --> vnode
        // 后续所有的逻辑操作 都会基于 vnode 去操作
        const vnode = createVNode(rootComponent)

        render(vnode, rootContainer)
      }
    }
  }
  return createApp
}

export {
	createAppAPI
}
