import { h } from '../../lib/guide-mini-vue.esm.js'

window.self = null

const App = {
	// .vue
	// <template></template>

	// render
	render () {
		window.self = this
		return h(
			'dev',
			{
				id: 'root',
				class: ['red', 'hard']
			},
			// string 类型
			// setupState 能够获取到setup种返回的 变量
			// this.$el --> 获取到 组件的根节点 dom实例

			`hi, ${this.msg}`,

			// array 类型
			// [
			// 	h('p', { class: 'red' }, 'hi'),
			// 	h('div', { class: 'blue' }, 'mini-vue'),
			// ]
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