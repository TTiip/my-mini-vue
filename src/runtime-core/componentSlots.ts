import { ShapeFlags } from '../shared/ShapeFlags'

const initSlots = (instance, children) => {
	// instance.slots = Array.isArray(children) ? children : [children]

	// 处理转换成对象 格式的数据
	// const slots = {}
	// for (const key in children) {
	// 	const val = children[key]
	// 	slots[key] = (props) => normalizeSlotValue(val(props))
	// }
	// instance.slots = slots
	// slots

	const { vnode } = instance;
	if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
		normalizeObjectSlots(children, instance.slots);
	}
}

const normalizeObjectSlots = (children: any, slots: any) =>{
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotValue(value(props));
  }
}

const normalizeSlotValue = (value) =>{
  return Array.isArray(value) ? value : [value];
}

export {
	initSlots
}
