<template>
  <div class="camera">
    <video 
      ref="videoRef" 
      class="video-preview" 
      autoplay 
      playsinline 
      muted
    ></video>
  </div>
</template>

<script setup lang="ts" name="Camera">
import { ref, onMounted, onUnmounted } from 'vue';

const videoRef = ref<HTMLVideoElement | null>(null);
const cameraStream = ref<MediaStream | null>(null);
// 获取所有摄像头设备
const getAllCameraDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    console.log('摄像头设备列表:', videoDevices);
    return videoDevices.length;
  } catch (error) {
    console.error('获取设备列表失败:', error);
    return 0;
  }
};
onMounted(async () => {
  const cameraCount = await getAllCameraDevices();
  console.log(`检测到 ${cameraCount} 个摄像头设备`);
});

// 获取指定标签的摄像头设备
// const getSpecificCameraDevice = async () => {
//   try {
//     const devices = await navigator.mediaDevices.enumerateDevices();
//     const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
//     // 查找指定标签的摄像头
//     const specificCamera = videoDevices.find(device => 
//       device.label === 'USB2.0 HD UVC WebCam (13d3:56a2)'
//     );

//     // 打印当前使用的摄像头label
//     if (specificCamera) {
//       console.log('当前使用的摄像头:', specificCamera.label);
//     }
    
//     return specificCamera ? specificCamera.deviceId : null;
//   } catch (error) {
//     console.error('获取设备列表失败:', error);
//     return null;
//   }
// };

// 获取指定标签的摄像头设备或随机选择一个
const getSpecificCameraDevice = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    // 查找指定标签的摄像头
    const specificCamera = videoDevices.find(device => 
      device.label === 'USB2.0 HD UVC WebCam (13d3:56a2)'
    );

    // 打印当前使用的摄像头label
    if (specificCamera) {
      console.log('当前使用的摄像头:', specificCamera.label);
      return specificCamera.deviceId;
    } else if (videoDevices.length > 0) {
      // 如果找不到指定摄像头，随机选择一个
      const randomCamera = videoDevices[Math.floor(Math.random() * videoDevices.length)];
      console.log('未找到指定摄像头，随机选择:', randomCamera.label);
      return randomCamera.deviceId;
    }
    
    return null;
  } catch (error) {
    console.error('获取设备列表失败:', error);
    return null;
  }
};

// 获取指定摄像头流并显示
const getCameraStream = async () => {
  try {
    // 获取指定摄像头设备ID
    const specificCameraId = await getSpecificCameraDevice();
    
    // 构造约束条件
    const constraints: MediaStreamConstraints = {
      video: specificCameraId ? { deviceId: specificCameraId } : true,
      audio: false
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraStream.value = stream;
  
    // 将流设置到视频元素
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
    }
    console.log('指定摄像头已启动');
  } catch (error) {
    console.error('获取指定摄像头失败:', error);
  }
};

// 停止摄像头流
const stopCameraStream = () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop());
    cameraStream.value = null;
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
};

// 暴露方法给父组件使用
defineExpose({
  getAllCameraDevices,
  getCameraStream,
  stopCameraStream,
  cameraStream 
});

onMounted(async () => {
  await getAllCameraDevices()
  await getCameraStream()
});
// 添加 onUnmounted 钩子，在组件卸载时停止摄像头流
onUnmounted(() => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop());
    cameraStream.value = null;
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
});
</script>

<style scoped>
.camera {
  position: fixed; /* 或 absolute */
  top: 80px;
  right: 40px;
  z-index: 1000; /* 确保在最上层 */
  width: 300px;
  height: 200px;
  display: flex;
  flex-direction:row-reverse;
}
.video-preview {  
  width: 80%;
  height: 80%;
  object-fit: cover;
  /* background-color: red; */
  /* border-width: 5px;
  border-color: red; */
}
</style>