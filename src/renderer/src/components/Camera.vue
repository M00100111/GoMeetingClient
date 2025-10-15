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
// 获取所有摄像头设备信息
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

// 获取指定标签的摄像头设备或随机选择一个
const getCameraDevice = async () => {
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
    console.error('获取摄像头设备失败:', error);
    return null;
  }
};

// 获取指定摄像头流并显示
const getCameraStream = async () => {
  try {
    // 获取指定摄像头设备ID
    const specificCameraId = await getCameraDevice();
    // 构造约束条件
    const constraints: MediaStreamConstraints = {
      video: specificCameraId ? { deviceId: specificCameraId } : true,
      audio: false
    };
    // 获取摄像头流
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('获取摄像头流成功:', stream)
    cameraStream.value = stream;
    console.log('将摄像头流设置到视频元素');
    // 将摄像头流设置到视频元素
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
    }
    // 将摄像头流注册到 WebRTC 服务
    console.log('将摄像头流注册到 WebRTC 服务');
    webRTCMediaService.registerVideoStream(stream);
  } catch (error) {
    console.error('获取摄像头流失败,尝试创建虚拟流进行测试:', error);
    try {
      // 创建虚拟流作为替代
      const virtualStream = createVirtualStream();
      cameraStream.value = virtualStream;
      if (videoRef.value) {
        videoRef.value.srcObject = virtualStream;
      }
      // 将虚拟流注册到 WebRTC 服务
      webRTCMediaService.registerVideoStream(virtualStream);
      console.log('虚拟流创建成功并已注册到 WebRTC 服务');
    } catch (virtualError) {
      console.error('创建虚拟流也失败了:', virtualError);
    }
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

// 无法获取摄像头时生成虚拟流以进行测试
const createVirtualStream = (): MediaStream => {
  // 创建 canvas 元素用于生成虚拟视频流
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建 canvas 上下文');
  }
  
  // 绘制动画内容
  let angle = 0;
  const draw = () => {
    if (ctx) {
      // 清空画布
      ctx.fillStyle = `hsl(${angle % 360}, 50%, 50%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制移动的方块
      ctx.fillStyle = 'white';
      const x = (canvas.width / 2) + Math.sin(angle * Math.PI / 180) * 100;
      const y = (canvas.height / 2) + Math.cos(angle * Math.PI / 180) * 100;
      ctx.fillRect(x - 25, y - 25, 50, 50);
      
      // 绘制时间戳
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText(new Date().toLocaleTimeString(), 20, 30);
      
      angle += 2;
    }
    requestAnimationFrame(draw);
  };
  
  draw();
  
  // 从 canvas 创建媒体流
  const stream = canvas.captureStream(30); // 30 FPS
  
  // 为轨道添加标识
  stream.getVideoTracks().forEach(track => {
    (track as any).streamType = 'virtual';
  });
  
  return stream;
};

// WebRTC
import { webRTCMediaService } from '@/utils/webrtc'

onMounted(async () => {
  // 获取所有摄像头设备信息
  const cameraCount = await getAllCameraDevices();
  console.log(`检测到 ${cameraCount} 个摄像头设备`);
  // 获取摄像头资源并注册到webrtc
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

// 暴露方法给父组件使用
defineExpose({
  getAllCameraDevices,
  getCameraStream,
  stopCameraStream,
  cameraStream 
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