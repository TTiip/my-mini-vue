const App = {
	// .vue3
	// <template></template>
	// render
	render() {
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