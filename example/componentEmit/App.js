import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  render() {
    // emit
    return h('div', {}, [
      h('div', {}, 'App'),
      h(Foo, {
        count: 123,
        onAdd(a, b) {
          console.log('on-add', a, b)
        },
        onAddFoo() {
          console.log('on-add-foo')
        }
      })
    ])
  },
  setup() {
    return {}
  }
}

