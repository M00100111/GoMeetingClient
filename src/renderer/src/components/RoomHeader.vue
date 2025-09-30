<template>
  <div class="roomheader">
    <div class="room-name">
      <div class="meeting-name-text">{{roomStore.roomInfo.meetingName}}</div>
    </div>

    <div class="room-time">
        <img class="icon" src="@/assets/icon/timing.svg"></img>
        <div class="meeting-time-text">{{meetingDuration}}</div>
    </div>

    <div class="roomheader-bottons">
      <div class="titlebar-button">
        <img class="icon minimize" @click="minimizeWindow" src="@/assets/icon/minimize.svg"></img>
      </div>
      <div class="titlebar-button">
        <img class="icon maximize" @click="maximizeWindow" src="@/assets/icon/maximize1.svg"></img>
      </div>
      <div class="titlebar-button">
        <img class="icon close" @click="closeWindow" src="@/assets/icon/close.svg">
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts" name="RoomHeader">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoomStore } from '@/store/room';
const roomStore = useRoomStore();

const meetingDuration = ref('00:00:00');
let timer: NodeJS.Timeout | null = null;

// 计算会议持续时间
const calculateDuration = () => {
  if (roomStore.roomInfo.startTime) {
    const startTimeNum = Number(roomStore.roomInfo.startTime);
    const startTimeMs = startTimeNum > 1e10 ? startTimeNum : startTimeNum * 1000;

    const now = Date.now();
    const diff = Math.floor((now - startTimeMs) / 1000); // 转换为秒

    if (diff >= 0) {
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      meetingDuration.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
};

// 启动定时器更新时间
onMounted(() => {
  calculateDuration();
  timer = setInterval(calculateDuration, 1000);
});

// 清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});


const minimizeWindow = () => {
  (window as any).MyAPI.minimizeWindow()
}
const maximizeWindow = () => {
  (window as any).MyAPI.maximizeWindow()
}
const closeWindow = () => {
  (window as any).MyAPI.closeWindow()
}
</script>

<style scoped>
  /* css here */
  .roomheader{
    width: 100%;
    height: 40px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
  }

  .roomheader-bottons{
    height: 40px;
    width: 100px;
    display: flex;
    justify-content:space-evenly;
    align-items:center;
    -webkit-user-drag: none;   
    user-select: none;        /* 禁止拖拽 */
    -webkit-app-region: no-drag;
  }
  .titlebar-button, .room-time{
    min-width: 25px;    /* 添加最小宽度 */
    min-height: 20px;   /* 添加最小高度 */
    padding: 4px;       /* 添加内边距 */
    justify-content: center; /* 水平居中图标 */
    display: flex;
    align-items: center;
  }
  .titlebar-button:hover{
    background-color: #EBEBEB;
  }
  .icon{
    -webkit-user-drag: none;     /* 禁止拖拽 */
    user-select: none;         /* 标准写法 */
    width: 18px;
    height: 18px;
  }

  /* 新增 room-name 样式 */
  .room-name {
    /* background-color: red; */
    /* width: 50px; */
    display: flex;
    align-items: center;
    padding-left: 16px;
    /* flex: 1; */
    min-width: 0; /* 允许文本收缩 */
  }

  /* 修改 meeting-name-text 样式，使其看起来像次要文字 */
  .meeting-name-text {
    font-size: 14px;
    color: #888; /* 更浅的颜色表示次要文字 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
    font-weight: 400; /* 较细的字体 */
    letter-spacing: 0.2px; /* 微调字符间距 */
    opacity: 0.8; /* 降低透明度突出次要特性 */
    -webkit-user-drag: none;     /* 禁止拖拽 */
    user-select: none;         /* 标准写法 */
  }
  .meeting-time-text {
    font-size: 14px;
    color: #666;
    margin-left: 5px;
    font-family: 'Monaco', 'Consolas', monospace;
    font-weight: 500;
    -webkit-user-drag: none;     /* 禁止拖拽 */
    user-select: none;         /* 标准写法 */
    cursor: default;
  }
</style>