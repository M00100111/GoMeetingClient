import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

//引入路由器
// import router from './router'

//引入router/index下的路由器
import router from '@/router/index'
//引入store/index下的pinia
import { pinia } from './store/index.js'

const app = createApp(App)

// 添加路由监听来验证当前路径
router.isReady().then(() => {
  console.log('Current route path:', router.currentRoute.value.path)
})

//使用路由器
app.use(router)
//使用pinia
app.use(pinia)
app.mount('#app')
