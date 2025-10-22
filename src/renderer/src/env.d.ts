/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const vueComponent: DefineComponent<{}, {}, any>
  export default vueComponent
}

export interface MyAPI {
  resizeWindow: (width: number, height: number) => void
  getDesktopSources: (options: Electron.SourcesOptions) => Promise<Electron.DesktopCapturerSource[]>
}

declare global {
  interface Window {
    MyAPI: MyAPI
  }
}