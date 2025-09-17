<template>
  <div class="navigate">
    <div class="top">
      <img class="avatar" src="@/assets/image/avatar.jpg" alt="user-info">
    </div> 

    <div class="middle">
      <!-- 路由路径 -->
      <RouterLink class="item" to="/meeting">
        <img class="icon" src="@/assets/icon/meeting.svg" alt="meeting">
      </RouterLink>
      <RouterLink class="item" to="/social">
        <img class="icon" src="@/assets/icon/social.svg" alt="social">
      </RouterLink>
    </div>

    <div class="bottom">
      <img class="icon" src="@/assets/icon/settings.svg" alt="settings">
    </div>
  </div>
</template>

<script setup lang="ts" name="Navigate">

</script>

<style scoped>
  /* css here */
  .navigate {
    width: 100%;
    height: 100%;
    display: flex;
    /* 主轴方向从上到下,侧轴从左到右 */
    flex-direction:column;
    /* 横向内容溢出向下换行 */
    flex-wrap:wrap;
    /* 整体均匀分布,边缘无空白 */
    /* justify-content: space-between; */
    /* 整体均匀分布,边缘有空白,盒子之间的空白是边缘空白的俩倍 */
    justify-content:space-around;
    /* 子元素居中对齐 */
    align-items: center
  }

  .top{
    align-self: center;
    display: flex;
    flex-direction:column;
    /* 横向内容溢出向下换行 */
    flex-wrap:wrap;
    
  }
  /* 用户头像 */
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;    
  }

  .middle{
    height: 50%;
    align-self: center;
    display: flex;
    flex-direction:column;
    /* 横向内容溢出向下换行 */
    flex-wrap:wrap;
    /* 整体均匀分布,边缘有空白,盒子之间的空白与边缘空白相同 */
    justify-content:space-evenly;
  }
  .icon{
    width: 30px;
    height: 30px;
  }

  .bottom{
    align-self: center;
    display: flex;
    flex-direction:column;
    /* 横向内容溢出向下换行 */
    flex-wrap:wrap;
  }

  .item{
    height: 60px;
    width: 100%;
    display: flex;
    flex-direction:column;
    /* 子元素居中对齐 */
    align-items: center;
    justify-content:space-evenly;
  }
</style>