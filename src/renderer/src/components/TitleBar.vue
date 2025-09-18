<template>
  <div class="titlebar">
    <div class="titlebar-button">
      <img class="icon minimize" @click="minimizeWindow" src="@/assets/icon/minimize.svg" alt="minimize"></img>
    </div>
    <div class="titlebar-button">
      <img class="icon close" @click="closeWindow" src="@/assets/icon/close.svg" alt="close">
    </div>
  </div>
</template>

<script setup lang="ts" name="TitleBar">
const minimizeWindow = () => {
  (window as any).MyAPI.minimizeWindow()
}
const closeWindow = () => {
  (window as any).MyAPI.closeWindow()
}
</script>

<style scoped>
  /* css here */
  .titlebar{
    width: 100%;
    height: 20px;
    display: flex;
    /* 右对齐 */
    justify-content:flex-end;
    user-select: none;
  }
  .titlebar-button{
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