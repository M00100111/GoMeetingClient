<template>
  <div class="roomheader">
    <div class="room-name">
      <div class="meeting-name-text">{{meetingName}}</div>
    </div>

    <div class="room-time">
        <img class="icon" src="@/assets/icon/timing.svg"></img>
        <div class="meeting-time-text">{{meetingTime}}</div>
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
  }
  .titlebar-button, .room-time{
    min-width: 25px;    /* 添加最小宽度 */
    min-height: 20px;   /* 添加最小高度 */
    padding: 4px;       /* 添加内边距 */
    justify-content: center; /* 水平居中图标 */
    display: flex;
    align-items: center;
    -webkit-app-region: no-drag;
  }
  .titlebar-button:hover{
    background-color: #EBEBEB;
  }
  .icon{
    width: 18px;
    height: 18px;
  }
</style>