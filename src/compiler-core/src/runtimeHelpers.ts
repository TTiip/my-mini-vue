const TO_DISPLAY_STRING = Symbol('toDisplayString')
const CREATE_ELEMENT_VNODE = Symbol('ctreateElementVNode')

const helperMapName = {
  [TO_DISPLAY_STRING]: 'toDisplayString',
  [CREATE_ELEMENT_VNODE]: 'ctreateElementVNode'
}

export {
	helperMapName,
	TO_DISPLAY_STRING,
	CREATE_ELEMENT_VNODE
}
