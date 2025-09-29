import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    // 安全地暴露 API 到渲染进程
    contextBridge.exposeInMainWorld('MyAPI', {
      resizeWindow: (width: number, height: number) => {
        console.log('MyAPI', width, height)
        ipcRenderer.send('resize-window', width, height)
      },
      minimizeWindow: () => ipcRenderer.send('window-control', 'minimize'),
      closeWindow: () => ipcRenderer.send('window-control', 'close'),
      createNewWindow: (route: string) => ipcRenderer.invoke('create-new-window', route)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
