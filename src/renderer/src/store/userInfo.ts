import { defineStore } from 'pinia'
import api from '@/api/api'
import { convertImgUrl } from '@/utils/index'

export const useUserInfoStore = defineStore('userInfo', {
  //存储数据
  state() {
    return {
      //用户登录状态
      login_flag:false,
      // 用户基本数据
      userInfo: {
        userId: '',
        username: '访客',
        email: '',
        avatar: '',
        introduction:'这个人很酷,什么都没有留下。',
        articleLikeSet: [],
        commentLikeSet: [],
      },
      token: null,
    }
  },
  // 当state中的数据需要经过处理在使用时可使用getters存放处理函数
  getters: {//func中默认会收到state参数
    loginFlag:(state) => state.login_flag,  
    userId: (state) => state.userInfo.userId ?? '',
    username: (state) => state.userInfo.username ?? '',
    avatar: (state) => 'https://i0.hdslb.com/bfs/article/da03a68e8014974df4900e7397023b1380b1f09e.jpg',
    email: (state) => state.userInfo.email ?? '',
    articleLikeSet: (state) => state.userInfo.articleLikeSet || [],
    commentLikeSet: (state) => state.userInfo.commentLikeSet || [],
  },
  //存放修改数据的动作函数
  actions: {//this.变量或$state.变量
    //更改登录状态
    setLoginStatus(flag:boolean) {
      this.login_flag = flag
    },
    //更新用户基本数据
    setUserInfo(data:any) {
      this.userInfo.userId = data.ID
      this.userInfo.username = data.username
      this.userInfo.email = data.email
      this.userInfo.avatar = convertImgUrl(data.avatar)
      this.userInfo.introduction = data.introduction
    },
    //存入token
    setToken(token: any) {
      this.token = token
    },
    //重置登录状态
    resetLoginState() {
      //  Vue 3 中 Composition API 的一个方法，用于重置组件的状态到初始值
      this.$reset()
    },
    //登出
    async logout() {
      await api.logout()
      this.$reset()
    },
    //获取用户基本信息
    async getUserInfo() {
      //没有token
      if (!this.token) {
        return
      }
      //根据token获取用户基本信息
      try {
        const response = await api.getUserInfo()
        //更新用户基本数据
        if (response.data.code === 200) {
          const data = response.data
          this.userInfo = {
            userId: data.id,
            username: data.username,
            email: data.email,
            avatar: data.avatar ? convertImgUrl(data.avatar) : 'https://i0.hdslb.com/bfs/article/da03a68e8014974df4900e7397023b1380b1f09e.jpg',
            introduction:data.introduction,
            // 将数组中的每个元素转换为数字类型
            articleLikeSet: data.article_like_set.map((e:string) => +e),
            commentLikeSet: data.comment_like_set.map((e:string) => +e),
          }
          return Promise.resolve(response.data)
        }
        else {
          return Promise.reject(response)
        }
      }
      catch (error) {
        return Promise.reject(error)
      }
    }

  },
  // 持久化token到localStorage
  persist: {
    // 存放在storage中的持久化数据的键
    key: 'userInfo',
    // state中需要持久化的数据
    pick: ['token','login_flag','userInfo']
  },
})