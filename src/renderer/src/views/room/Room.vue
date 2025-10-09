<template>
  <div class="room">
    <div class="page-container">
      <RoomHeader/>
      <RoomMain/>
      <Camera ref="cameraRef" v-if="userInfoStore.userInfo.cameraStatus === true" />
      <!-- 只有当数据加载完成后再渲染 RoomFooter -->
      <RoomFooter v-if="dataLoaded"/>
      <Micro ref="microRef" v-if="userInfoStore.userInfo.micStatus === true" />
      <Screen ref="screenRef" v-if="userInfoStore.userInfo.screenStatus === true" />
      
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
  </div>
</template>

<script setup lang="ts" name="Room">
import { ref,onMounted, nextTick } from 'vue';
import RoomHeader from '@/components/RoomHeader.vue';
import RoomMain from '@/components/RoomMain.vue';
import RoomFooter from '@/components/RoomFooter.vue';

import { useUserInfoStore } from '@/store/userInfo';
const userInfoStore = useUserInfoStore()
import { useRoomStore } from '@/store/room';
const roomStore = useRoomStore();

import BaseDialog from '@/components/BaseDialog.vue'
import { useConfirmDialog } from '@/store/confirmDialog'
const confirmDialog = useConfirmDialog()

const dataLoaded = ref(false); // 定义响应式变量
/* 
  获取麦克风、摄像头、屏幕视频流
*/
// // 分别管理不同类型的流
// const micStream = ref<MediaStream | null>(null);
// const cameraStream = ref<MediaStream | null>(null);
// const screenStream = ref<MediaStream | null>(null);
// // 获取麦克风流
// const getMicrophoneStream = async () => {
//   try {
//     micStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
//   } catch (error) {
//     console.error('获取麦克风失败:', error);
//   }
// };

// // 获取摄像头流
// const getCameraStream = async () => {
//   try {
//     cameraStream.value = await navigator.mediaDevices.getUserMedia({ video: true });
//   } catch (error) {
//     console.error('获取摄像头失败:', error);
//   }
// };

// // 获取屏幕共享流
// const getScreenStream = async () => {
//   try {
//     screenStream.value = await navigator.mediaDevices.getDisplayMedia({
//       video: true,
//       audio: true
//     });
//   } catch (error) {
//     console.error('获取屏幕共享失败:', error);
//   }
// };

import Camera from '@/components/Camera.vue';
import Micro from '@/components/Micro.vue';
import Screen from '@/components/Screen.vue';
onMounted(async () => {
    // 启动摄像头预览
  // if (cameraRef.value) {
  //   await cameraRef.value.getCameraStream();
  // }

  try {
    const result = await roomStore.getRoomInfo()
    console.log('获取会议信息成功:', result)
    // 入会时获取所有成员信息
    await roomStore.getRoomMembersInfo()
    dataLoaded.value = true; // 数据加载完成后设置为 true
  } catch (error) {
    
    console.error(error)
  }
  
  
  // 待实现ws推送成员信息变更
})

// WebRTC
import { webRTCMediaService } from '@/utils/webrtc'
// 引用各个媒体组件
const cameraRef = ref<InstanceType<typeof Camera> | null>(null)
const microRef = ref<InstanceType<typeof Micro> | null>(null)
const screenRef = ref<InstanceType<typeof Screen> | null>(null)
// 创建组合流
const createCombinedStream = (): MediaStream => {
  const combinedStream = new MediaStream()
  
  // 添加摄像头流轨道
  if (cameraRef.value?.cameraStream) {
    cameraRef.value.cameraStream.getTracks().forEach(track => {
      combinedStream.addTrack(track)
    })
  }
  
  // 添加麦克风流轨道
  if (microRef.value?.audioStream) {
    microRef.value.audioStream.getTracks().forEach(track => {
      combinedStream.addTrack(track)
    })
  }
  
  // 添加屏幕共享流轨道
  if (screenRef.value?.screenStream) {
    screenRef.value.screenStream.getTracks().forEach(track => {
      combinedStream.addTrack(track)
    })
  }
  
  return combinedStream
}

onMounted(async () => {
  try {
    const result = await roomStore.getRoomInfo()
    console.log('获取会议信息成功:', result)
    await roomStore.getRoomMembersInfo()
    dataLoaded.value = true
    
    // 等待所有组件初始化完成
    await nextTick()
    
    // 创建组合流并设置到 WebRTC 服务
    const combinedStream = createCombinedStream()
    webRTCMediaService.setLocalStream(combinedStream)
  } catch (error) {
    console.error(error)
  }
})
</script>

<style scoped>
  /* css here */
  .page-container{
    height: 676px;
    width: 1020px;
    background-color: white;
    -webkit-app-region: drag;
    border-radius: 5px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    overflow: hidden;
  }
  
</style>