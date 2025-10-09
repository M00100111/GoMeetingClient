import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [vue()],
    // 前端应用服务器配置
    server: {
      host: '127.0.0.1', // 只监听 IPv4来避免 IPv6 相关的权限问题
      port: 15173 // 15173被WSL设置为保留端口
    }
  }
})
