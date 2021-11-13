import { h, getCurrentInstance  } from '../../lib/mini-vue.esm.js'

const Foo = {
	name: 'Foo',
	setup () {
		const instance = getCurrentInstance()
    console.log('Foo', instance)

		return{}
	},
	render () {
		const foo= h('p', {}, 'foo')

		return h('div', {}, [foo])
	}
}

export {
	Foo
}
