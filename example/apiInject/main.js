// vue3
import { createApp } from '../../lib/mini-vue.esm.js'
import { Provider } from './Provider.js'

// const rootComponent = document.querySelector('#app')
// createApp(App).mount(rootComponent)

createApp(Provider).mount('#app')
