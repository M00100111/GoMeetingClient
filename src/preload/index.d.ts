import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    MyAPI: {
      resizeWindow: (width: number, height: number) => void
      minimizeWindow: () => void
      closeWindow: () => void
    }
  }
}
