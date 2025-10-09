<template>
  <div class="micro">
    <!-- 麦克风组件可以包含音频可视化或其他UI元素 -->
  </div>
</template>

<script setup lang="ts" name="Micro">
import { ref, onMounted, onUnmounted } from 'vue';

const audioStream = ref<MediaStream | null>(null);

// 添加获取所有麦克风设备的函数
const getAllMicrophoneDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    return audioDevices;
  } catch (error) {
    console.error('获取麦克风设备列表失败:', error);
    return [];
  }
};
onMounted(async () => {
  const audioDevices = await getAllMicrophoneDevices();
  console.log('麦克风设备列表:', audioDevices);
});

// 获取指定标签的麦克风设备或随机选择一个
const getSpecificMicrophoneDevice = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    
    // 可以根据需要查找特定标签的麦克风
    // 示例：查找包含特定名称的麦克风
    // const specificMicrophone = audioDevices.find(device => 
    //   device.label.includes('USB Audio Device')
    // );

    // 如果找到了特定麦克风，返回其deviceId
    // if (specificMicrophone) {
    //   console.log('当前使用的麦克风:', specificMicrophone.label);
    //   return specificMicrophone.deviceId;
    // } else 
    if (audioDevices.length > 0) {
      // 如果找不到指定麦克风，随机选择一个
      const randomMicrophone = audioDevices[Math.floor(Math.random() * audioDevices.length)];
      console.log('使用麦克风:', randomMicrophone.label);
      return randomMicrophone.deviceId;
    }
    
    return null;
  } catch (error) {
    console.error('获取麦克风设备列表失败:', error);
    return null;
  }
};

// 获取麦克风流
const getMicrophoneStream = async () => {
  try {
    // 获取指定麦克风设备ID
    const specificMicrophoneId = await getSpecificMicrophoneDevice();
    
    // 构造约束条件
    const constraints: MediaStreamConstraints = {
      audio: specificMicrophoneId ? { deviceId: specificMicrophoneId } : true,
      video: false
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    audioStream.value = stream;
    
    console.log('麦克风已启动');
    return stream;
  } catch (error) {
    console.error('获取麦克风失败:', error);
  }
};

// 停止麦克风流
const stopMicrophoneStream = () => {
  if (audioStream.value) {
    audioStream.value.getTracks().forEach(track => track.stop());
    audioStream.value = null;
  }
};

// 暴露方法给父组件使用
defineExpose({
  getAllMicrophoneDevices,
  getMicrophoneStream,
  stopMicrophoneStream
});

onMounted(async () => {
  await getMicrophoneStream();
});

// 添加 onUnmounted 钩子，在组件卸载时停止麦克风流
onUnmounted(() => {
  if (audioStream.value) {
    audioStream.value.getTracks().forEach(track => track.stop());
    audioStream.value = null;
  }
});
</script>

<style scoped>
/* .micro {
  
} */
</style>