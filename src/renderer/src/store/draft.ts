import { defineStore } from 'pinia'
import type {ArticleFormInterface} from "@/types/article";

export const useDraftStore = defineStore('draft', {
  //存储数据
  state() {
    return {
      draft_flag:false,
      articleForm : <ArticleFormInterface>{
        title: '',
        subTitle: '',
        image:'',
        content: '',
        category: 0,
        tags: [],
        status:0,
      },
    }
  },
  // 当state中的数据需要经过处理在使用时可使用getters存放处理函数,通过xxxStore.xxx调用
  getters: {//func中默认会收到state参数
    // 函数名(state) {} OR 变量名:(state)=>{}
    existDraft: (state) => state.draft_flag
  },
  //存放修改数据的动作函数
  actions: {//this.变量或state.变量
    resetDraft() {
      this.$reset()
    },
    // 函数名() {this.变量} OR 变量名:(state)=>{state.变量}
    saveDraft(articleForm: ArticleFormInterface) {
      this.draft_flag = true
      this.articleForm = articleForm
    }
  },
  persist: {
    // 存放在storage中的持久化数据的键
    key: 'draft',
    // state中需要持久化的数据
    pick: ['draft_flag','articleForm']
  },
})