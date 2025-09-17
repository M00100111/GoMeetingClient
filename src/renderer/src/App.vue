<template>
  <div class="app">
      <router-view />
  </div>
</template>

<script setup lang="ts" name="App">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const observer = ref<ResizeObserver | null>(null)

// 监听路由变化
watch(route, (to, from) => {
  console.log('从', from.name, '切换到', to.name)
  
  // 当路由变化时，尝试获取组件尺寸信息
  setTimeout(() => {
    sendComponentSizeToElectron()
  }, 100)
}, { deep: true })

// 发送组件尺寸信息给 Electron 主进程
function sendComponentSizeToElectron() {
  try {
    // 查找当前页面中的 page-container 元素
    const container = document.querySelector('.page-container')
    if (container) {
      const rect = container.getBoundingClientRect()
      console.log('Container size:', rect.width, rect.height)

      // 通过 IPC 发送尺寸信息给 Electron 主进程
      if (window.MyAPI?.resizeWindow) {
        window.MyAPI.resizeWindow(rect.width, rect.height)
      } else {
        console.warn('未找到 electronAPI.resizeWindow 方法')
      }
    }
  } catch (error) {
    console.error('发送尺寸信息失败:', error)
  }
}

// 钩子函数
onMounted(() => {
  // 初始调整
  setTimeout(() => {
    sendComponentSizeToElectron()
  }, 100)
  
  // 创建 ResizeObserver
  observer.value = new ResizeObserver(() => {
    sendComponentSizeToElectron()
  })
  
  // 观察 app 元素
  const appElement = document.querySelector('.app')
  if (appElement) {
    observer.value.observe(appElement)
  }
})
</script>

<style scoped>
.app {
  min-width: fit-content;
  min-height: fit-content;
}
</style>