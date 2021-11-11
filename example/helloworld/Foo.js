import { h } from '../../lib/mini-vue.esm.js'

const Foo = {
	name: 'Foo',
	setup (props) {
		// console.log(props, 'props')
		// props.count++
		// console.log(props, 'props')
	},
	render () {
		return h('div', {}, `Foo: ${this.count}`)
	}
}

export {
	Foo
}
