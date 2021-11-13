import { h, renderSlots } from '../../lib/mini-vue.esm.js'

const Foo = {
	name: 'Foo',
	setup () {},
	render () {
		const foo= h('p', {}, 'foo')

		// foo --> .vnode.children
		// 获取到 虚拟节点的 children 进行渲染
		// 此处的 children 必须是 vnode 但是实际使用可能是 多个 那这里的$slots可能就是一个数组

		// return h('div', {}, [
		// 	foo,
		// 	// ...this.$slots,
		// 	renderSlots(this.$slots)
		// ])

		// 渲染到指定位置

		// 具名插槽
		// 1.获取到要渲染的元素
		// 2.获取到要渲染的位置

		// 作用域插槽
		const age = 18
		return h('div', {}, [
			renderSlots(this.$slots, 'header', {
				age
			}),
			foo,
			// ...this.$slots,
			renderSlots(this.$slots, 'footer')
		])
	}
}

export {
	Foo
}
