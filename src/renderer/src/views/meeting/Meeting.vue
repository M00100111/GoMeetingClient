<template>
  <div class="meeting">
    <div class="notice">
        <div class="notice-head">
          <div class="date">
            <div class="date-day">{{date.day}}</div>
            <div class="date-week">{{date.week}}</div>
          </div>
          <div class="all-meeting">
            <img class="all-meeting-icon" src="@/assets/icon/allmeeting1.svg">
          </div>
        </div>
        <div class="notice-content">
          <div class="coffee">
            <img class="coffee-icon" src="@/assets/icon/coffee.svg">
            <span class="coffee-icon-span">暂无会议</span>
          </div>
        </div>
    </div>
    <div class="menu">
      <div class="meeting-button">
        <div class="meeting-button-bottom" @click="openStartMeetingForm">
          <img class="meeting-icon quick-icon" src="@/assets/icon/quick.svg">
        </div>
        <span class="meeting-icon-span">快速会议</span>
      </div>
      <div class="meeting-button" @click="showConfirmDialog">
        <div class="meeting-button-bottom">
          <img class="meeting-icon join-icon" src="@/assets/icon/join.svg">
        </div>
        <span class="meeting-icon-span">加入会议</span>
      </div>
      <div class="meeting-button">
        <div class="meeting-button-bottom">
          <img class="meeting-icon appoint-icon" src="@/assets/icon/appoint.svg">
        </div>
        <span class="meeting-icon-span">预定会议</span>
      </div>
      <div class="meeting-button">
        <div class="meeting-button-bottom">
          <img class="meeting-icon share-item" src="@/assets/icon/join1.svg">
        </div>
        <span class="meeting-icon-span">屏幕共享</span>
      </div>
      
      
    </div>
  </div>
</template>

<script setup lang="ts" name="Meeting">
import '@/styles/fonts.css'
import { reactive, onMounted } from 'vue';
import UserForm from '@/components/UserForm.vue'
import StartMeetingForm from '@/components/StartMeetingForm.vue'


// 对象类型
let date = reactive({
  day: 'XXXX年X月X日',
  week: '星期X'
})

onMounted(() => {
  const now = new Date()
  date.day = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // weekday: 'long'
  })
  date.week = now.toLocaleDateString('zh-CN', {
    weekday: 'long'
  })
})

import { useConfirmDialog } from '@/store/confirmDialog'
import { useFormDialog } from '@/store/formDialog'

const confirmDialog = useConfirmDialog()
const formDialog = useFormDialog()

// 普通确认模态框
const showConfirmDialog = () => {
  confirmDialog.open({
    title: '删除确认',
    content: '您确定要删除所有用户吗？此操作不可恢复。',
    confirmText: '删除',
    onConfirm: () => {
      console.log('执行删除操作')
      // 实际项目中调用API
    }
  })
}

// 打开用户表单
const openUserForm = () => {
  formDialog.open({
    title: '用户信息',
    component: UserForm,
    onSubmit: (data) => {
      console.log('用户表单提交数据:', data)
      // 处理提交逻辑
    }
  })
}

// 打开会议表单
const openStartMeetingForm = () => {
  formDialog.open({
    title: '开启会议',
    component: StartMeetingForm,
    componentProps: {
      // 可以传递特定属性给组件
      meetingType: 'video'
    },
    onSubmit: (data) => {
      console.log('会议表单提交数据:', data)
      // 处理提交逻辑
      doStartMeeting(data)
      
    }
  })
}

import api from "@/api/api"
  //定义开启会议函数
  const doStartMeeting = async (data) => {
    //调用登录接口
    try {
      const response = await api.startMeeting(data) as any;
      // 如果请求成功且业务状态码为200
      if (response.code) {
        
      }
      console.log("成功开启会议!!!");
      createMeetingWindow()
    } catch (error) {
      // 请求失败或业务状态码非200
      console.log("开启会议失败");
      console.log(error);
    }
  }


// 创建新的会议窗口
const createMeetingWindow = () => {
  (window as any).MyAPI.createNewWindow('/room')
}
// // 创建新的会议窗口
// const createLoginWindow = () => {
//   (window as any).MyAPI.createNewWindow('/login')
// }

</script>

<style scoped>
  /* css here */
  .meeting{
    width: 100%;
    height: 100%;
    display: flex;
    align-items:center;
  }
  .notice{
    width: 60%;
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content:space-evenly;
    align-items: center;
    /* background-color: red; */
  }
  
  .notice-head{
    width: 100%;
    height: 30%;
    display: flex;
    justify-content:space-evenly;
    align-items:center;
    /* background-color: brown; */
  }
  .all-meeting{
    height: 40px;
    width: 40px;
    -webkit-app-region: no-drag;
    cursor:pointer
    /* background: green; */
  }
  .all-meeting-icon{
    height: 40px;
    width: 40px;
  }

  .date{
    /* background-color: red; */
    width: 200px;
    height: 100px;
    display: flex;
    flex-direction:column;
    justify-content:space-evenly;

    font-family: "得意黑";
    font-weight:normal;
  }
  .date-day{
    font-size: 25px;
  }
  .date-week{
    font-size: 20px;
  }

  .coffee{
    /* background-color: green; */
    height: 150px;
    width:120px;
    display: flex;
    flex-direction: column;
    justify-content:space-between;
    align-items: center;
  }
  .coffee-icon{
    width: 120px;
    height: 120px;
  }
  .coffee-icon-span{
    font-family: "得意黑";
    font-weight:lighter;
    font-size: 14px;
  }

  .menu{
    /* background-color: red; */
    width: 40%;
    display: flex;
    justify-content:space-evenly;
    flex-wrap:wrap;
  }
  .meeting-button{
    width: 90px;
    height: 110px;
    /* background: green; */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
  }
  .meeting-button-bottom{
    width: 70px;
    height: 70px;
    border-radius: 17px;
    background: #157AFF;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-app-region: no-drag;
    cursor:pointer
  }
  .meeting-button-bottom:hover{
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  }
  .meeting-icon{
    width: 50px;
    height: 50px;
  }
  .join-icon {
    height: 70%;
    width: 70%;
  }
  .quick-icon {
    height: 60%;
    width: 60%;
  }
  .appoint-icon {
    height: 55%;
    width: 55%;
  }
  .share-item {
    height: 60%;
    width: 60%;
  }
  .meeting-icon-span{
    font-family: "得意黑";
    font-weight:lighter;
    font-size: 14px;
  }
  
</style>