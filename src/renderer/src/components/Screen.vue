<template>
  <div class="screen">
    <video 
      ref="screenRef" 
      class="screen-preview" 
      autoplay 
      playsinline 
      muted
    ></video>
  </div>
</template>

<script setup lang="ts" name="Screen">
import { ref, onMounted, onUnmounted } from 'vue';
// 引入 Electron 特定的类型
import type { ElectronMediaStreamConstraints } from '@/types/electron';
const screenRef = ref<HTMLVideoElement | null>(null);
const screenStream = ref<MediaStream | null>(null);

// WebRTC
import { webRTCMediaService } from '@/utils/webrtc'

// 获取屏幕流
const getScreenStream = async () => {
  try {
    let stream: MediaStream;
    
    // 首先尝试使用标准的getDisplayMedia API
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        } as MediaTrackConstraints & { cursor: string },
        audio: false
      });
    } catch (standardError) {
      console.warn('标准getDisplayMedia失败，尝试Electron桌面捕获API:', standardError);
      
      // 如果标准API失败，尝试使用Electron的desktopCapturer
      if (window.MyAPI && typeof window.MyAPI.getDesktopSources === 'function') {
        try {
          // 获取桌面源
          const sources = await window.MyAPI.getDesktopSources({
            types: ['screen', 'window']
          });
          
          console.log('获取到的桌面源:', sources);
          
          // 这里应该显示一个选择界面让用户选择要共享的屏幕或窗口
          // 为简化起见，我们选择第一个屏幕源
          if (sources && sources.length > 0) {
            const source = sources[0]; // 选择第一个源
            console.log('选择的源:', source);
            
            // 使用Electron的约束条件获取流
            const constraints: ElectronMediaStreamConstraints = {
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: source.id,
                  minWidth: 1280,
                  maxWidth: 1920,
                  minHeight: 720,
                  maxHeight: 1080
                }
              }
            };
            
            stream = await navigator.mediaDevices.getUserMedia(constraints);
          } else {
            throw new Error('未找到可用的桌面源');
          }
        } catch (desktopCaptureError: any) {
          console.error('Electron桌面捕获API失败:', desktopCaptureError);
          throw new Error('无法访问桌面捕获API: ' + desktopCaptureError.message);
        }
      } else {
        console.error('MyAPI或getDesktopSources不可用');
        console.log('当前window对象属性:', Object.keys(window));
        if (window.MyAPI) {
          console.log('MyAPI属性:', Object.keys(window.MyAPI));
        }
        throw new Error('不支持屏幕共享API');
      }
    }
    
    console.log('获取屏幕流成功:', stream)
    screenStream.value = stream;
    
    // 将屏幕流设置到视频元素
    if (screenRef.value) {
      screenRef.value.srcObject = stream;
    }
    
    // 将屏幕流注册到 WebRTC 服务
    console.log('将屏幕流注册到 WebRTC 服务');
    webRTCMediaService.registerScreenStream(stream);
    
    // 监听屏幕共享结束事件
    stream.getVideoTracks()[0].onended = () => {
      console.log('屏幕共享已结束');
      stopScreenStream();
    };
    
  } catch (error) {
    console.error('获取屏幕流失败:', error);
    throw error;
  }
};

// 停止屏幕流
const stopScreenStream = () => {
  if (screenStream.value) {
    // 从WebRTC服务中移除屏幕轨道
    screenStream.value.getVideoTracks().forEach(track => {
      // 停止轨道
      track.stop();
      // 通知WebRTC服务移除轨道
      webRTCMediaService.removeTrackByTypeAndId('screen', track.id);
    });
    screenStream.value = null;
  }
  if (screenRef.value) {
    screenRef.value.srcObject = null;
  }
};

onMounted(async () => {
  // 获取屏幕资源并注册到webrtc
  try {
    await getScreenStream()
  } catch (error) {
    console.error('初始化屏幕共享失败:', error);
  }
});

// 添加 onUnmounted 钩子，在组件卸载时停止屏幕流
onUnmounted(() => {
  stopScreenStream();
});

// 暴露方法给父组件使用
defineExpose({
  getScreenStream,
  stopScreenStream,
  screenStream 
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
.screen-preview {  
  width: 80%;
  height: 80%;
  object-fit: cover;
}
</style>