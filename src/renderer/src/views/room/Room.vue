<template>
  <div class="room">
    <div class="page-container">
      <RoomHeader/>
      <RoomMain/>
      <RoomFooter/>
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
import { onMounted } from 'vue';
import RoomHeader from '@/components/RoomHeader.vue';
import RoomMain from '@/components/RoomMain.vue';
import RoomFooter from '@/components/RoomFooter.vue';
import { useConfirmDialog } from '@/store/confirmDialog'
import BaseDialog from '@/components/BaseDialog.vue'
const confirmDialog = useConfirmDialog()
import { useUserInfoStore } from '@/store/userInfo';
import { useRoomStore } from '@/store/room';

// const userInfoStore = useUserInfoStore();
const roomStore = useRoomStore();

onMounted(async () => {
  try {
    const result = await roomStore.getRoomInfo()
    console.log('获取会议信息成功:', result)

    // 入会时获取所有成员信息
    await roomStore.getRoomMembersInfo()
  } catch (error) {
    
    console.error(error)
  }
  
  
  // 待实现ws推送成员信息变更
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