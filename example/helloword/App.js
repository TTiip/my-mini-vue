const App = {
	// .vue
	// <template></template>

	// render
	render () {
		return h('dev', 'hi, mini-vue' + this.msg)
	},
	setup () {
		// composition api

		return {
			msg: 'mini-vue'
		}
	}
}

export {
	App
}