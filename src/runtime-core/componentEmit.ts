import { camelize, toHandlerKey } from '../shared'

const emit = (instance, event, ...args) => {
	// instance.props --> 是否存在event

	const { props } = instance
	// TPP
	// 先去写一个特定的行为 --> 重构成通用行为
	// add --> Add
	// add-foo --> AddFoo

	const handler = props[toHandlerKey(camelize(event))]

	handler && handler(...args)
}

export {
	emit
}
