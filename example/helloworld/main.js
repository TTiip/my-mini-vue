// vue3
import { createApp } from '../../lib/mini-vue.esm.js'
import { App } from './app.js'

const rootComponent = document.querySelector('#app')

createApp(App).mount(rootComponent)
