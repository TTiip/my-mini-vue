import { h } from '../../lib/guide-mini-vue.esm.js'

const App = {
	// .vue
	// <template></template>

	// render
	render () {
		return h(
			'dev',
			{
				id: 'root',
				class: ['red', 'hard']
			},
			// string 类型
			// `hi, mini-vue ${this.msg}`

			// array 类型
			[
				h('p', { class: 'red' }, 'hi'),
				h('div', { class: 'blue' }, 'mini-vue'),
			]
		)
	},
	setup () {
		// composition api

		return {
			msg: 'mini-vue'
		}
	}
}

export default App