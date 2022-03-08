// 组件 provide 和 inject 功能
import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js'

const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'fooVal1')
    provide('bar', 'barVal1')
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(ProviderTwo)])
  }
}

const ProviderTwo = {
  name: 'ProviderTwo',
  setup() {
    provide('foo', 'fooVal2')
    // provide('bar', 'barVal2')

    const foo = inject('foo')
    const bar = inject('bar')

    return {
      foo,
      bar
    }
  },
  render() {
    return h('div', {}, [
      h('p', {}, `ProviderTwo: ${this.foo} & ${this.bar}`),
      h(ProviderThree)
    ])
  }
}

const ProviderThree = {
  name: 'ProviderThree',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    // const baz = inject("baz", 'bazDefault')
    const baz = inject('baz', () => 'bazDefault')

    return {
      foo,
      bar,
      baz
    }
  },

  render() {
    return h('div', {}, `ProviderThree: ${this.foo} & ${this.bar} & ${this.baz}`)
  }
}

const App = {
  name: 'App',
  setup() {},
  render() {
    return h('div', {}, [h('p', {}, ''), h(Provider)])
  }
}

export {
  App
}
