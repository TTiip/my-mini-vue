import { h } from '../../lib/guide-mini-vue.esm.js'

const Foo = {
	name: 'Foo',
	render () {
		return h(
			'dev',
			{
				class: 'Foo',
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

			`Foo, ${this.count}`,
		)
	},
	setup (props) {
		props.count++
		console.log(props)
		// props 是一个 readonly 类型
		return {
			msg: 'Foo'
		}
	}
}

export default Foo