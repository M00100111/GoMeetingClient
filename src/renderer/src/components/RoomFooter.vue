<template>
  <div class="roomfooter">
    <div class="user-status">
      <div class="user-status-botton">
        <img class="user-status-icon micro" @click="" src="@/assets/icon/micro_close.svg"/>
      </div>
      <div class="user-status-botton">
        <img class="user-status-icon camera" @click="" src="@/assets/icon/camera_close.svg"/>
      </div>
      <div class="user-status-botton">
        <img class="user-status-icon screen" @click="" src="@/assets/icon/screen_close.svg"/>
      </div>
    </div>

    <div class="room-menu">
      <div class="room-menu-botton">
        <img class="room-menu-icon invite" @click="" src="@/assets/icon/invite.svg"/>
      </div>
      <div class="room-menu-botton">
        <img class="room-menu-icon member" @click="" src="@/assets/icon/member.svg"/>
      </div>
      <div class="room-menu-botton">
        <img class="room-menu-icon chat" @click="" src="@/assets/icon/chat.svg"/>
      </div>
    </div>

    <div class="exit-room">
      <div class="room-menu-botton exit-botton" @click="showEndConfirmDialog"
      v-if="userType !== undefined  && userType != 0"
      >
        <img class="room-menu-icon end" @click="" src="@/assets/icon/end.svg"/>
      </div>
      <div class="room-menu-botton exit-botton" @click="showLeaveConfirmDialog">
        <img class="room-menu-icon exit" @click="" src="@/assets/icon/exit.svg"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="RoomFooter">
import api from "@/api/api"
import { useRoomStore } from '@/store/room';
const roomStore = useRoomStore();
import { useUserInfoStore } from '@/store/userInfo';
import { ref, onMounted } from "vue";
const userInfoStore = useUserInfoStore();

const userId = userInfoStore.userInfo?.userId;
const userType = ref<number | undefined >(undefined );

onMounted(() => {
  // 入会时获取用户信息
  // 待实现ws推送成员信息变更

  if (userId !== undefined) {
    userType.value = roomStore.roomMembers.get(Number(userId))?.userType;
  }
  console.log('用户类型:', userType);
});

const handleLeaveRoom = async () => {
  const response = await api.leaveMeeting({ meetingId: roomStore.roomInfo.meetingId });
  if ((response as any).code === 200) {
    console.log('退出会议成功')
    roomStore.leaveRoom();
    (window as any).MyAPI.closeWindow();
  } else {
    console.log('退出会议失败')
  }
};

const handleEndRoom = async () => {
  const response = await api.endMeeting({ meetingId: roomStore.roomInfo.meetingId });
  if ((response as any).code === 200) {
    console.log('结束会议成功')
    roomStore.leaveRoom();
    (window as any).MyAPI.closeWindow();
  } else {
    console.log('结束会议失败')
  }
};

import { useConfirmDialog } from '@/store/confirmDialog'
const confirmDialog = useConfirmDialog()
const showLeaveConfirmDialog = () => {
  confirmDialog.open({
    title: '退出确认',
    content: '您确定要退出吗？',
    confirmText: '退出',
    onConfirm: () => {
      console.log('执行退出操作')
      // 实际项目中调用API
      handleLeaveRoom();
    }
  })
}
const showEndConfirmDialog = () => {
  confirmDialog.open({
    title: '结束确认',
    content: '您确定要结束会议吗？',
    confirmText: '结束',
    onConfirm: () => {
      console.log('执行结束会议操作')
      // 实际项目中调用API
      handleEndRoom();
    }
  })
}
</script>

<style scoped>
  /* css here */
  .roomfooter{
    width: 100%;
    height: 60px;
    background-color: #fff;
    display: flex;
    justify-content:space-between;
    align-items:center;
  }

  .user-status{
    height: 100%;
    width: 170px;
    display: flex;
    align-items: center;
    justify-content:space-evenly;
    /* background-color: red; */
  }
  .user-status-botton,.room-menu-botton {
    height: 50px;
    width: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    -webkit-app-region: no-drag;
    border-radius: 5px;
    /* background-color: green; */
    -webkit-user-drag: none;     /* 禁止拖拽 */
    user-select: none;         /* 标准写法 */
    cursor: default;
  }
  .user-status-botton:hover,.room-menu-botton:hover{
    background-color: #EBEBEB;
  }
  .user-status-icon, .room-menu-icon{
    width: 25px;
    -webkit-user-drag: none;     /* 禁止拖拽 */
    user-select: none;         /* 标准写法 */
    cursor: default;
  }

  .room-menu{
    height: 100%;
    width: 250px;
    display: flex;
    align-items: center;
    justify-content:space-evenly;
    /* background-color: red; */
  }

  .chat{
    width: 35px;
  }
  .room-menu-botton:hover .invite {
    content: url('@/assets/icon/invite_focus.svg');
  }
  .room-menu-botton:hover .member {
    content: url('@/assets/icon/member_focus.svg');
  }
  .room-menu-botton:hover .chat {
    content: url('@/assets/icon/chat_focus.svg');
  }
  .room-menu-botton:hover .exit {
    content: url('@/assets/icon/exit_focus.svg');
  }

  .end{
    width: 21px;
  }

  .exit-room{
    height: 100%;
    width: 170px;
    display: flex;
    align-items: center;
    justify-content:flex-end;
  }
  .exit-botton{
    margin-right: 5px;
  }
</style>