import { defineStore } from 'pinia'
import {watch} from 'vue'
//模态框类型
export const enum ModalType {
  notice = "notice",
  confirm = "confirm",
  warning = "warning",
}
//确认结果
export const enum ModalResult{
  cancel = "cancel",
  confirm = "confirm",
  undefined = "undefined"
}
// 定义模态框接口
export interface ModalInterface {
  show: boolean,
  type: ModalType,
  timeOut: number,
  noticeTag:number,
  title: string,
  content: string,
  result: ModalResult,
}

export const useModalStore = defineStore('modal', {
  //存储数据
  state() {
    return {
      //模态框结构体
      modal: {
        show: false,    
        type: ModalType.notice,
        timeOut: 3000,
        noticeTag:0,
        title: '标题',
        content: '内容',
        result: ModalResult.undefined,
      } as ModalInterface,
    }
  },
  // 当state中的数据需要经过处理在使用时可使用getters存放处理函数,通过xxxStore.xxx调用
  getters: {//func中默认会收到state参数
    
  },
  //存放修改数据的动作函数
  actions: {//this.变量或$state.变量
    //根据类型展示模态框
    ShowModal(type: ModalType,title:string, content: string) {
      this.modal.title = title
      this.modal.type = type
      this.modal.content = content
      if (type == ModalType.notice) {
        this.modal.noticeTag = Date.now()
      }
      this.modal.show = true
    },
    CloseModal(result: ModalResult) {
      this.modal.result = result;
      this.modal.show = false;
    },
    Notice(content:string) {
      this.ShowModal(ModalType.notice,'Notice',content);
    },

    Confirm(content: string): Promise<unknown> {
      return new Promise((resolve, reject) => {        
        this.ShowModal(ModalType.confirm, 'Confirm', content);    
        // 假设有一个方法来监听模态框的结果
        const handleResult = () => {
          if (this.modal.result === ModalResult.confirm) {
            resolve(true);            
          } else {
            reject(false);
          }
        }
        // 监听模态框结果变化
        const unwatch = watch(
          () => this.modal.result,
          (newResult) => {
            if (newResult !== ModalResult.undefined) {
              handleResult();
              this.modal.result = ModalResult.undefined
              unwatch(); // 停止监听
            }
          }
        );
      }).catch(err=>{})  
    },
    Warning(content: string): boolean {    
      this.ShowModal(ModalType.warning, 'Warning', content);
      return true
    }
  }
})