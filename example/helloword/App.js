import { h } from '../../lib/guide-mini-vue.esm.js'
import Foo from './Foo.js'

window.self = null

const App = {
	// .vue
	// <template></template>

	name: 'App',
	// render
	render () {
		window.self = this
		return h(
			'dev',
			{
				id: 'root',
				class: ['red', 'hard'],
        onClick () {
          console.log('click')
        },
        onMousedown () {
          console.log('mousedown')
        }
			},
			// string 类型
			// setupState 能够获取到setup种返回的 变量
			// this.$el --> 获取到 组件的根节点 dom实例

			// `hi, ${this.msg}`,

			// array 类型
			// [
			// 	h('p', { class: 'red' }, 'hi'),
			// 	h('div', { class: 'blue' }, 'mini-vue'),
			// ]
			[h('div', {}, `hi, ${this.msg}`), h(Foo, { count: 12 })]
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