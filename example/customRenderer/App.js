import { h } from '../../lib/mini-vue.esm.js'

export const App = {
  setup() {
    return {
      x: 300,
      y: 300
    }
  },
  render() {
    return h('vue', { x: this.x, y: this.y })
  }
}