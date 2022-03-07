import { ShapeFlags } from '../shared/ShapeFlags'

const initSlots = (instance, children) => {
	const { vnode } = instance
	// 如果是 slot 类型 再进行处理
	if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
		normalizeObjectSlots(instance.slots, children)
	}
}

const normalizeObjectSlots = (slots, children) => {
	for (const key in children) {
		const slotVal = children[key]
		// 将设计的 props 传入对应的 slot
		slots[key] = (props) => normalizeSlotValue(slotVal(props))
	}

	slots = slots
}

const normalizeSlotValue = (value) => {
	// 传入的 children（slots） 是不是数组，不是数组转换一下
	return Array.isArray(value) ? value: [value]
}

export {
	initSlots
}