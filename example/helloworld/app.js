import { h } from '../../lib/mini-vue.esm.js'


const App = {
	// .vue3
	// <template></template>
	// render
	render() {
		// ui 逻辑
		return h(
			'div',
			{
				id: ['root', 'root1'],
				class: ['red1', 'hard1']
			},
			// string 类型的内容
			// `hi, mini-vue`
			// array 类型的内容
			[
				h('p', { class: ['blue', 'font1'] }, 'hi'),
				h('p', { class: ['red', 'font2'] }, 'nini-vue')
			]
		)
	},
	setup () {
		return {
			msg: 'mini-vue'
		}
	}
}

export {
	App
}
