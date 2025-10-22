<template>
  <div class="roommain">
    <div 
      id="remote-videos" 
      class="remote-videos-container"
      :class="containerClass"
    >
      <!-- 远程媒体流将在这里显示 -->
    </div>
    <div id="remote-audios" 
      class="remote-audios-container">
    </div>
  </div>
</template>

<script setup lang="ts" name="RoomMain">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 存储远程视频元素的引用
const remoteVideos = ref<HTMLElement[]>([])

// 监听DOM变化以更新视频数量
const observeRemoteVideos = () => {
  const container = document.getElementById('remote-videos')
  if (!container) return
  
  const observer = new MutationObserver(() => {
    // 更新视频元素列表
    remoteVideos.value = Array.from(container.children) as HTMLElement[]
  })
  
  observer.observe(container, {
    childList: true,
    subtree: true
  })
  
  return observer
}

// 容器类
const containerClass = computed(() => {
  return {
    'remote-videos-container': true,
    'single-video-layout': remoteVideos.value.length === 1,
    'multiple-videos-layout': remoteVideos.value.length > 1
  }
})

let mutationObserver: MutationObserver | null = null

onMounted(() => {
  mutationObserver = observeRemoteVideos() || null
  
  // 初始获取已存在的视频元素
  const container = document.getElementById('remote-videos')
  if (container) {
    remoteVideos.value = Array.from(container.children) as HTMLElement[]
  }
})

onUnmounted(() => {
  if (mutationObserver) {
    mutationObserver.disconnect()
  }
})
</script>

<style scoped>
.roommain {
  background-color: white;
  width: 100%;
  height: calc(100% - 100px);
  border-top: 0.5px solid #ccc;
  border-bottom: 0.5px solid #ccc;
  position: relative;
}

.remote-videos-container {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 10px;
  padding: 10px;
  justify-content: center;
  align-content: center;
}

.remote-videos-container video{
  background-color: red;
  object-fit: cover;
  border: 1px solid #444;
  border-radius: 8px;
  background-color: #333;
  width: 100%;
  height: 100%;
}

/* 单个视频时占据整个画面 */
.single-video-layout {
  display: flex !important;
  justify-content: center;
  align-items: center;
  padding: 0;
  gap: 0;
}

.single-video-layout > * {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  border-radius: 0;
  border: none;
}

/* 单个视频时隐藏音频元素 */
.single-video-layout audio {
  display: none;
}

/* 多个视频时的网格布局 */
.multiple-videos-layout {
  --video-count: 0;
  --columns: 1;
  --rows: 1;
}

/* 2个视频: 水平排列 */
.multiple-videos-layout:has(> :nth-child(2):not(:nth-child(3))) {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
}

/* 3个视频: 水平排列 */
.multiple-videos-layout:has(> :nth-child(3):not(:nth-child(4))) {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr;
}

/* 4个视频: 2x2网格 */
.multiple-videos-layout:has(> :nth-child(4):not(:nth-child(5))) {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

/* 5-6个视频: 3列网格 */
.multiple-videos-layout:has(> :nth-child(5):not(:nth-child(7))),
.multiple-videos-layout:has(> :nth-child(6):not(:nth-child(7))) {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

/* 7-9个视频: 3x3网格 */
.multiple-videos-layout:has(> :nth-child(7):not(:nth-child(10))),
.multiple-videos-layout:has(> :nth-child(8):not(:nth-child(10))),
.multiple-videos-layout:has(> :nth-child(9):not(:nth-child(10))) {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}

/* 10-12个视频: 4列网格 */
.multiple-videos-layout:has(> :nth-child(10):not(:nth-child(13))),
.multiple-videos-layout:has(> :nth-child(11):not(:nth-child(13))),
.multiple-videos-layout:has(> :nth-child(12):not(:nth-child(13))) {
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}

/* 13-16个视频: 4x4网格 */
.multiple-videos-layout:has(> :nth-child(13):not(:nth-child(17))),
.multiple-videos-layout:has(> :nth-child(14):not(:nth-child(17))),
.multiple-videos-layout:has(> :nth-child(15):not(:nth-child(17))),
.multiple-videos-layout:has(> :nth-child(16):not(:nth-child(17))) {
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
}

/* 16个以上视频: 5列网格 */
.multiple-videos-layout:has(> :nth-child(17)) {
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: repeat(auto-fill, 1fr);
}
</style>