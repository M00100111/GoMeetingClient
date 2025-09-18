//引入路由器
import { createRouter, createWebHashHistory } from 'vue-router'
//引入组件
import IndexAndRegistry from '@/views/loginAndRegister/LoginAndRegister.vue'
import Home from '@/views/home/Home.vue'
import Meeting from '@/views/meeting/Meeting.vue'
//创建路由器
const router = createRouter({
  history: createWebHashHistory(),
  // history: createWebHistory(),
  routes: [
    //路由规则
    {
      path: '/',
      name: '主页',
      redirect: '/meeting',
      component: Home,
      children: [
        //子路由
        {
          name: 'meeting',
          path: 'meeting',
          component: Meeting
        }
      ]
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
