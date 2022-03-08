import { createRender } from '../runtime-core'

const createElement = (type) => {
	return document.createElement(type)
}

const patchProp = (el, key, val) => {
	// 实现注册 事件
	const isOn = key => /^on[A-Z]/.test(key)
	if (isOn(key)) {
		const eventName = key.slice(2).toLowerCase()
		el.addEventListener(eventName, val)
	} else {
		el.setAttribute(key, val)
	}
}

const insert = (el, container) => {
	container.append(el)
}

const render = createRender({
	createElement,
	patchProp,
	insert
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

export * from '../runtime-core'