<template>
  <div class="home">
    <div class="page-container">
      <!-- 导航区 -->
      <div class="navigate-container">
        <Navigate/>
      </div>
      <TitleBar></TitleBar>
      <!-- 展示区 -->
      <div class="main-content">
        <RouterView></RouterView>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Home">
//引入路由展示区标签
import { RouterView } from 'vue-router'
import Navigate from '@/components/Navigate.vue';
import TitleBar from '@/components/TitleBar.vue';
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
    background-color: #F3F3F4;
    /* 垂直居中 */
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>