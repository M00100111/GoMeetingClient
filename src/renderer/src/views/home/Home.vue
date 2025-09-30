<template>
  <div class="home">
    <div class="page-container">
      <!-- 导航区 -->
      <div class="navigate-container">
        <Navigate/>
      </div>
      <!-- 展示区 -->
      <div class="main-content">
        <TitleBar></TitleBar>
        <RouterView></RouterView>
      </div>
      
      <!-- 普通确认模态框 (在父组件中挂载) -->
      <BaseDialog
        v-model:visible="confirmDialog.visible"
        :title="confirmDialog.title"
        :confirmText="confirmDialog.confirmText"
        :cancelText="confirmDialog.cancelText"
        @confirm="confirmDialog.handleConfirm"
        @cancel="confirmDialog.handleCancel"
      >
        <p>{{ confirmDialog.content }}</p>
      </BaseDialog>

      <!-- 提交表单模态框 (在父组件中挂载) -->
      <!-- <BaseDialog
        v-model:visible="formDialog.visible"
        :title="formDialog.title"
        @confirm="handleFormConfirm"
        @cancel="formDialog.close"
      >
        <UserForm ref="userFormRef" />
      </BaseDialog> -->
      <!-- 提交表单模态框 (在父组件中挂载) -->
      <BaseDialog
        v-model:visible="formDialog.visible"
        :title="formDialog.title"
        @confirm="handleFormConfirm"
        @cancel="formDialog.close"
      >
        <component 
          :is="formDialog.component" 
          ref="dynamicFormRef" 
          v-bind="formDialog.componentProps"
        />
      </BaseDialog>

    </div>
  </div>
</template>

<script setup lang="ts" name="Home">
//引入路由展示区标签
import { shallowRef, onMounted,ComponentPublicInstance  } from 'vue'
import { RouterView } from 'vue-router'
import Navigate from '@/components/Navigate.vue';
import TitleBar from '@/components/TitleBar.vue';
import { useConfirmDialog } from '@/store/confirmDialog'
import { useFormDialog } from '@/store/formDialog'
import BaseDialog from '@/components/BaseDialog.vue'
const confirmDialog = useConfirmDialog()
const formDialog = useFormDialog()

// import UserForm from '@/components/UserForm.vue'
// import StartMeetingForm from '@/components/StartMeetingForm.vue'

// const userFormRef = ref<InstanceType<typeof UserForm> | null>(null)
import { websocketService } from '@/utils/websocket'
console.log("挂载home组件");
// 检查并建立连接
const checkAndConnect = async () => {
  console.log("检测是否已建立ws连接");
  // 检查当前连接状态
  const currentStatus = websocketService.getConnectionStatus()
  if (!currentStatus) {
    console.log('WebSocket未连接,正在建立连接...')
    const success = await websocketService.connect('ws://localhost:8081/ws')
    if (success) {
      // 注册全局消息处理器
      registerGlobalHandlers()
      console.log('成功建立WebSocket连接');
    }
  } else {
    console.log('WebSocket已建立连接')
  }
}
onMounted(() => {
  // 组件挂载时检查并建立连接
  checkAndConnect()
})
// 父容器注册ws处理函数
const registerGlobalHandlers = () => {
  // 聊天消息处理器
  // websocketService.registerHandlers(MessageMethod.Chat_Method, (data: any) => {
  //   console.log('全局收到聊天消息:', data)
  //   // 这里可以触发全局事件总线或更新全局状态
  //   // 比如显示全局通知、更新未读消息数等
  
  //   // 根据你的MessageHandler类型，需要返回boolean
  //   return true // 处理成功
  // })

  // // 通知消息处理器
  // websocketService.registerHandlers(MessageMethod.Notification_Method, (data: any) => {
  //   console.log('全局收到通知:', data)
  //   // 处理全局通知，比如显示Toast通知
  
  //   return true
  // })

  // // 会议开始通知处理器
  // websocketService.registerHandlers(MessageMethod.Meeting_Start_Notice_Method, (data: any) => {
  //   console.log('会议开始:', data)
  //   // 可以跳转到会议页面或显示会议提醒
  
  //   return true
  // })

  // // 会议消息处理器
  // websocketService.registerHandlers(MessageMethod.Meeting_Message_Method, (data: any) => {
  //   console.log('会议消息:', data)
  //   // 处理会议中的实时消息
  
  //   return true
  // })
}
// 处理表单确认
// const handleFormConfirm = () => {
//   if (userFormRef.value) {
//     const formData = userFormRef.value.getFormData()
//     formDialog.handleSubmit(formData)
//   }
// }
// 动态表单引用
// const dynamicFormRef = ref<ComponentPublicInstance | null>(null)
const dynamicFormRef = shallowRef<ComponentPublicInstance | null>(null)
// 修改 handleFormConfirm 方法以适配动态表单
// const handleFormConfirm = () => {
//   if (dynamicFormRef.value) {
//     // 注意：这里假定所有表单组件都有 getFormData 方法
//     const formData = dynamicFormRef.value.getFormData?.()
//     formDialog.handleSubmit(formData)
//   }
// }
const handleFormConfirm = () => {
  if (dynamicFormRef.value && typeof (dynamicFormRef.value as any).getFormData === 'function') {
    const formData = (dynamicFormRef.value as any).getFormData();
    formDialog.handleSubmit(formData);
  }
}

// const confirmDialog = useConfirmDialog()
// const formDialog = useFormDialog()
</script>

<style scoped>
  /* css here */
  .page-container{    
    -webkit-app-region: drag; /* 整个容器可拖拽 */
    height: 480px;
    width: 720px;    
    margin:auto;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius:10px;
    background-color: #fff;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    overflow: hidden;
    /* 父容器开启flex布局 */
    display:flex; 
  }
  .navigate-container{
    /* 宽度为20% */
    width: 9%;
    height: 100%;
    background-color: #F3F3F4;
    /* 垂直居中 */
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .main-content{
    height: 100%;
    width: 91%;
    display: flex;
    flex-direction: column;
  }

</style>