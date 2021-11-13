import { creareRenderInstance } from '../../lib/mini-vue.esm.js'
import { App } from './App.js'

const app = new PIXI.Application({
  width: 600,
  height: 600,
  antialias: true,
  resolution: 1,
  backgroundColor: 0x1d9ce0
})/*  */

document.body.append(app.view)

const renderInstance = creareRenderInstance({
  createElement(type) {
    if (type === 'vue') {
      const avatar = new PIXI.Sprite.from('http://anata.me/img/avatar.jpg');

      app.ticker.add(() => {
        // 每秒调用该方法60次(60帧动画)
        avatar.rotation += 0.01;
      })

      return avatar
    }
  },
  patchProp(el, key, val) {
    console.log(el, key, val)
    el[key] = val
  },
  insert(el, parent) {
    parent.addChild(el)
  }
})

renderInstance.createApp(App).mount(app.stage)