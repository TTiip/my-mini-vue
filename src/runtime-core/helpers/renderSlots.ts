import { createNode } from '../vnode'

const renderSlots = (slots, name, props) => {
	const slot = slots[name]
	if (typeof slot === 'function') {
		return createNode('div', {}, slot(props))
	}
}

export {
	renderSlots
}
