import { createRender } from '../runtime-core'

const createElement = (type) => {
	return document.createElement(type)
}

const patchProp = (el, key, prevVal, nextVal) => {
	// 实现注册 事件
	const isOn = key => /^on[A-Z]/.test(key)
	if (isOn(key)) {
		const eventName = key.slice(2).toLowerCase()
		el.addEventListener(eventName, nextVal)
	} else {
		// 如果设置值为 undefined 或者 null 的时候删除掉该属性
		if (nextVal == null) {
			el.removeAttribute(key)
		} else {
			el.setAttribute(key, nextVal)
		}
	}
}

const insert = (child, parent, anchor = null) => {
	// parent.append(child)
	parent.insertBefore(child, anchor)
}

const remove = (children) => {
	const parent = children.parentNode
	if (parent) {
		parent.removeChild(children)
	}
}

const setElementText = (el, text) => {
	el.textContent = text
}

const render = createRender({
	createElement,
	patchProp,
	insert,
	remove,
	setElementText
})

const createApp = (...args: [any]) => {
	return render.createApp(...args)
}

export {
	createElement,
	patchProp,
	insert,
	render,
	createApp
}
