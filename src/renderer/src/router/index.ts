//引入路由器
import { createRouter, createWebHistory } from 'vue-router'
//引入组件
import IndexAndRegistry from '@/views/loginAndRegister/LoginAndRegister.vue'
import Home from '@/views/home/Home.vue'
//创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes: [
    //路由规则
    {
      path: '/',
      name: '主页',
      component: Home
    },
    {
      path: '/login',
      name: '登录',
      component: IndexAndRegistry
    }
  ]
})

//默认暴露
export default router
