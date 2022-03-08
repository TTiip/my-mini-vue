import { h } from '../../lib/guide-mini-vue.esm.js'

const App = {
  setup () {
    return {
      x: 100,
      y: 100
    }
  },
  render() {
    return h('rect', { x: this.x, y: this.y })
  }
}

export {
	App
}
