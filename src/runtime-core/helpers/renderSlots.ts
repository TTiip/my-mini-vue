import { createNode, Fragment } from '../vnode'

const renderSlots = (slots, name, props) => {
	const slot = slots[name]
	if (typeof slot === 'function') {
		// children 是不可以有 array
		// 只需要把 children里面的 全部渲染出来就行
		return createNode(Fragment, {}, slot(props))
	}
}

export {
	renderSlots
}
