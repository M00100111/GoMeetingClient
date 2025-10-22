import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: any
    MyAPI: {
      resizeWindow: (width: number, height: number) => void
      minimizeWindow: () => void
      closeWindow: () => void
      createNewWindow: (route: string) => Promise<void>
      getDesktopSources: (options: Electron.SourcesOptions) => Promise<Electron.DesktopCapturerSource[]>
    }
  }
}