<template>
  <div class="screen">
    <video 
      ref="videoRef" 
      class="video-preview" 
      autoplay 
      playsinline 
      muted
    ></video>
  </div>
</template>

<script setup lang="ts" name="Screen">
import { ref, onMounted, onUnmounted } from 'vue';

const videoRef = ref<HTMLVideoElement | null>(null);
const screenStream = ref<MediaStream | null>(null);

// 获取屏幕共享流
// const getScreenStream = async () => {
//   try {
//     // 使用 getDisplayMedia 获取屏幕共享流
//     const stream = await navigator.mediaDevices.getDisplayMedia({
//       video: true,
//       audio: true
//     });
//     screenStream.value = stream;
  
//     // 将流设置到视频元素
//     if (videoRef.value) {
//       videoRef.value.srcObject = stream;
//     }
//     console.log('屏幕共享已启动');
//     return stream;
//   } catch (error) {
//     console.error('获取屏幕共享失败:', error);
//   }
// };

const getScreenStream = async (): Promise<MediaStream | undefined> => {
  try {
    // 检查浏览器环境是否支持
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      console.error('当前环境不支持屏幕共享功能')
      return undefined
    }

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })
    screenStream.value = stream

    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
    console.log('屏幕共享已启动')
    return stream
  } catch (error: any) {
    console.error('获取屏幕共享失败:', error)
    // 提供更详细的错误信息
    if (error.name === 'NotSupportedError') {
      console.error('屏幕共享功能在当前环境中不受支持，请检查应用配置')
    } else if (error.name === 'NotAllowedError') {
      console.error('用户拒绝了屏幕共享请求')
    } else if (error.name === 'NotFoundError') {
      console.error('未找到可共享的屏幕设备')
    }
    return undefined
  }
}

// 停止屏幕共享流
const stopScreenStream = () => {
  if (screenStream.value) {
    screenStream.value.getTracks().forEach(track => track.stop());
    screenStream.value = null;
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
};

// 监听屏幕共享结束事件
const handleScreenShareEnd = () => {
  if (screenStream.value) {
    screenStream.value.getVideoTracks().forEach(track => {
      track.addEventListener('ended', () => {
        console.log('屏幕共享已结束');
        stopScreenStream();
      });
    });
  }
};

// 暴露方法给父组件使用
defineExpose({
  screenStream,
  getScreenStream,
  stopScreenStream
});

onMounted(async () => {
  await getScreenStream();
  handleScreenShareEnd();
});

// 添加 onUnmounted 钩子，在组件卸载时停止屏幕共享流
onUnmounted(() => {
  if (screenStream.value) {
    screenStream.value.getTracks().forEach(track => track.stop());
    screenStream.value = null;
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
});
</script>

<style scoped>
.screen {
  position: fixed;
  top: 80px;
  right: 40px;
  z-index: 1000;
  width: 300px;
  height: 200px;
  display: flex;
  flex-direction: row-reverse;
}
.video-preview {  
  width: 80%;
  height: 80%;
  object-fit: cover;
}
</style>