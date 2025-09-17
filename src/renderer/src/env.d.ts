/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const vueComponent: DefineComponent<{}, {}, any>
  export default vueComponent
}

export interface MyAPI {
  resizeWindow: (width: number, height: number) => void
}

declare global {
  interface Window {
    MyAPI: MyAPI
  }
}
