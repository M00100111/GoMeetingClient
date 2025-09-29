<template>
  <div class="room">
    <div class="page-container">
      <RoomHeader/>
      <RoomMain/>
      <RoomFooter/>
    </div>
  </div>
</template>

<script setup lang="ts" name="Room">
import RoomHeader from '@/components/RoomHeader.vue';
import RoomMain from '@/components/RoomMain.vue';
import RoomFooter from '@/components/RoomFooter.vue';
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