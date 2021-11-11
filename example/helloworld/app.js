import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

// 先试用全局变量去获取实例 做调试
window.self = null

const App = {
	// .vue3
	// <template></template>
	// render
	name: 'App',
	render() {
		window.self = this
		// ui 逻辑
		return h(
			'div',
			{
				id: ['root', 'root1'],
				class: ['red1', 'hard1'],
				onClick: () => {
					console.log('click')
				},
				onMousedown: () => {
					console.log('onMousedown')
				}
			},
			// setupState 里面的值
			// this.$el --> 返回组件实例
			// `hi, ${this.msg}`
			// string 类型的内容
			// `hi, mini-vue`
			// array 类型的内容
			// [
			// 	h('p', { class: ['blue', 'font1'] }, 'hi'),
			// 	h('p', { class: ['red', 'font2'] }, 'nini-vue')
			// ]
			[
				h('div', {}, `hi, ${this.msg}`),
				h(Foo, {
					count: 1
				})
			]
		)
	},
	setup () {
		return {
			msg: 'mini-vue-6666'
		}
	}
}

export {
	App
}
