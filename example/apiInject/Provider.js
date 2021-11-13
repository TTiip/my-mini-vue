import { h, provide, inject } from '../../lib/mini-vue.esm.js'

const Provider = {
  name: 'Provider',
  render() {
    return h('div', {}, [
      h('div', {}, 'Provider'),
      h(ConsumerBox)
    ])
  },
  setup() {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
  }
}

const Consumer = {
  name: 'Consumer',
  render() {
    return h('div', {}, `Consumer: - ${this.foo} - ${this.bar} - ${this.baz}`)
  },
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    const baz = inject('baz', 'initBaz')
    return {
      foo,
      bar,
      baz
    }
  }
}

const ConsumerBox = {
  name: 'ConsumerBox',
  render() {
    return h('div', {}, [
      h('div', {}, `ConsumerBox: - ${this.foo}`),
      h(Consumer)
    ])
  },
  setup() {
    provide('foo', 'foo-ConsumerBox')
    const foo = inject('foo')
    return {
      foo
    }
  }
}

export {
  Provider
}
