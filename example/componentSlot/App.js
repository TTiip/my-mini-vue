import { h, createTextVNode } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  render() {
    return h('div', {}, [
      h('div', {}, 'App'),
      // 单个值
      // h(Foo, {}, h('p', {}, '123')),

      // 数组 多个值
      // h(Foo, {}, [
      //   h('p', {}, '123'),
      //   h('p', {}, '456')
      // ]),

      // 渲染到指定位置
      h(
        Foo,
        {},
        {
          header: ({ age }) => [
            h('p', {}, '123----' + age),
            createTextVNode('你好呀！')
          ],
          footer: () => h('p', {}, '456')
        }
      )
    ])
  },
  setup() {
    return {}
  }
}
