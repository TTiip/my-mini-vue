import { h } from '../../lib/mini-vue.esm.js'

const Foo = {
	name: 'Foo',
	setup (props, { emit }) {
		const emitAdd = () => {
			emit('add', 666, 888)
			emit('add-foo')
		}
		return {
			props,
			emitAdd
		}
	},
	render () {
		const btn = h(
			'button',
			{
				onClick: this.emitAdd
			},
			'emmitAdd'
		)
		const foo = h('p', {}, `Foo: ${this.count}`)

		return h('div', {}, [
			foo,
			btn
		])
	}
}

export {
	Foo
}
