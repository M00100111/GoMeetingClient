<template>
  <div class="roommain">
    <div id="remote-videos" class="remote-videos-container"></div>
  </div>
</template>

<script setup lang="ts" name="RoomMain">

</script>

<style scoped>
  /* css here */
  .roommain{
    background-color: red;
    width: 100%;
    height: calc(100% - 100px);
    /* 添加边框 */
    border-top: 0.5px solid #ccc;    /* 上边框 */
    border-bottom: 0.5px solid #ccc; /* 下边框 */
  }
  .remote-videos-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
  }

.remote-videos-container video,
.remote-videos-container audio {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #333;
}
</style>