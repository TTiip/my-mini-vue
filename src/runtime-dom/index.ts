import { creareRenderInstance } from '../runtime-core'

const createElement = (type: string) => {
	return document.createElement(type)
}

const patchProp = (el, key, props) => {
	// 事件 onClick --> 具体 --> 通用
	// on + event name

	// 匹配是否是事件
	const val = props[key]
	const isOn = (key) => /^on[A-Z]/.test(key)
	if (isOn(key)) {
		// 去掉 事件名前面的 on
		const event = key.slice(2).toLowerCase()
		el.addEventListener(event, props[key])
	} else if ((key === 'class' || key === 'id') && Array.isArray(props[key])) {
		// 如果是 calss、id 且是一个 class、id 数组 则循环调用 添加class
		el.setAttribute(key, val.join(' '))
	} else {
		// 除去 class 和 id 且都是数据的情况 其他属性 直接赋值。
		el.setAttribute(key, val)
	}
}

const insert = (el, container) => {
	container.append(el)
}

const renderInstance: any = creareRenderInstance({
	createElement,
	patchProp,
	insert
})

const createApp = (...args) => {
	return renderInstance.createApp(...args)
}

export * from '../runtime-core'

export {
	createElement,
	patchProp,
	insert,
	renderInstance,
	createApp
}
