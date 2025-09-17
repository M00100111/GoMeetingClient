import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  //存储数据
  state() {
    return {   
      WebStatistics: {
        totalVisits:0,
        todayVisits:0,
      },
      page_list:[],
      blog_config:{
        website_name:'欢迎,RaY的个人博客'
      }
    }
  },
  // 当state中的数据需要经过处理在使用时可使用getters
  getters: {
    getTotalVisits:(state)=>state.WebStatistics.totalVisits,
    getTodayVisits:(state)=>state.WebStatistics.todayVisits,
    pageList(state) {
      //??[]空值合并运算符 
      // 如果 state.page_list 是 null 或 undefined，则返回一个空数组[]；否则，返回 state.page_list 的实际值。
      return state.page_list ?? []
    },
    blogConfig(state) {
      return state.blog_config
    },

  },
  //存放修改数据的动作函数
  actions: {//this.变量或state.变量
    setTotalVisits() {
      this.WebStatistics.totalVisits++
    },
    setTodayVisits() {
      this.WebStatistics.todayVisits++
    },    
  }
})