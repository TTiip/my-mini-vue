const App = {
	// .vue3
	// <template></template>
	// render
	render() {
		// ui 逻辑
		return h('div', `hi, ${this.msg}!`)
	},
	setup () {
		return {
			msg: 'mini-vue'
		}
	}
}

export {
	App
}
