//引入路由器
import { createRouter, createWebHashHistory } from 'vue-router'
//引入组件
import IndexAndRegistry from '@/views/loginAndRegister/LoginAndRegister.vue'
import Home from '@/views/home/Home.vue'
import Meeting from '@/views/meeting/Meeting.vue'
import Room from '@/views/room/Room.vue'

//创建路由器
const router = createRouter({
  history: createWebHashHistory(),
  // history: createWebHistory(),
  routes: [
    //路由规则
    {
      path: '/',
      name: '主页',
      // redirect: '/meeting',
      // 使用函数式重定向
      redirect: (_to) => {
        // 从 localStorage 中读取持久化的用户信息
        const userInfoStr = localStorage.getItem('userInfo')
        if (userInfoStr) {
          try {
            const userInfo = JSON.parse(userInfoStr)
            // 检查是否存在有效的 token
            if (userInfo.token && userInfo.expireTime && userInfo.expireTime > Date.now()) {
              return '/meeting'
            }
          } catch (e) {
            // 解析失败，视为未登录
          }
        }
        return '/login'
      },
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
    },
    {
      path: '/room',
      name: '会议室',
      component: Room
    }
  ]
})

//默认暴露
export default router
