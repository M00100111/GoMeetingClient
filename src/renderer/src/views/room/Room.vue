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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

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

// 获取流组件
import Camera from '@/components/Camera.vue';
import Micro from '@/components/Micro.vue';
import Screen from '@/components/Screen.vue';
onMounted(async () => {
  try {
    // 入会时获取所有成员信息
    const result = await roomStore.getRoomInfo()
    console.log('获取会议信息成功:', result)
    await roomStore.getRoomMembersInfo()

    dataLoaded.value = true; // 数据加载完成后设置为 true

    // 等待所有组件初始化完成
    await nextTick()

    // 初始化 WebRTC 服务

  } catch (error) { 
    console.error(error)
  }
})

onMounted(async () => {
  try {
    const result = await roomStore.getRoomInfo()
    console.log('获取会议信息成功:', result)
    await roomStore.getRoomMembersInfo()
    dataLoaded.value = true
  } catch (error) {
    console.error(error)
  }
})
// WebRTC
import { webRTCMediaService } from '@/utils/webrtc'
// 组件卸载时的资源清理
onUnmounted(() => {
  // 离开房间时清理WebRTC连接
  webRTCMediaService.leaveRoom()
  
  // 清理虚拟流资源
  const localVideo = document.getElementById('local-video') as HTMLVideoElement | null;
  if (localVideo && localVideo.srcObject) {
    const tracks = (localVideo.srcObject as MediaStream).getTracks();
    tracks.forEach(track => track.stop());
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