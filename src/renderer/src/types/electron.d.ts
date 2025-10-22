// Electron 特定的类型声明
export interface ElectronMediaTrackConstraints extends MediaTrackConstraints {
  mandatory?: {
    chromeMediaSource?: string;
    chromeMediaSourceId?: string;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
}

export interface ElectronMediaStreamConstraints extends MediaStreamConstraints {
  video: boolean | ElectronMediaTrackConstraints;
}

// 扩展 Window 接口
declare global {
  interface Window {
    MyAPI: {
      resizeWindow: (width: number, height: number) => void
      minimizeWindow: () => void
      closeWindow: () => void
      createNewWindow: (route: string) => Promise<void>
      getDesktopSources: (options: Electron.SourcesOptions) => Promise<Electron.DesktopCapturerSource[]>
    }
  }
}