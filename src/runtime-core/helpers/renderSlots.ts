import { createVNode, Fragment } from '../vnode'

const renderSlots = (slots, slotName, props) => {
	const slot = slots[slotName]

	if (slot) {
		if (typeof slot === 'function') {
			return createVNode(Fragment, {}, slot(props))
		}
	}
}

export {
	renderSlots
}
