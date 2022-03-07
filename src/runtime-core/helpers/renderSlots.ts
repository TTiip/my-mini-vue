import { createVNode } from '../vnode'

const renderSlots = (slots, slotName, props) => {
	const slot = slots[slotName]

	if (slot) {
		if (typeof slot === 'function') {
			return createVNode('div', {}, slot(props))
		}
	}
}

export {
	renderSlots
}
