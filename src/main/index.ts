import { app, session, shell, BrowserWindow, ipcMain, globalShortcut } from 'electron'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// 主渲染线程
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // width: 800, // 设置一个合适的默认宽度
    // height: 600, // 设置一个合适的默认高度
    show: false,
    autoHideMenuBar: true,
    frame: false, // 隐藏边框
    // resizable: true, // 允许调整窗口大小
    resizable: false, // 不允许调整窗口大小
    // backgroundColor: '#ffffff',
    // backgroundColor: '#000000', // 设置背景颜色
    transparent: true, // 启用透明窗口
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      // nodeIntegration: true, // 启用 Node.js 集成
      // contextIsolation: false, // 禁用上下文隔离
      webSecurity: false //CSP
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 👇 在这里添加打开开发者工具的代码
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 新打开渲染进程页面
function createNewWindow(route: string): void {
  const meetingWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: false,
    // frame: true,
    frame: false,
    // backgroundColor: '#353533',
    // transparent: false,
    transparent: true,
    resizable: false, // 添加这行来禁止调整大小
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      // 开发环境中可以禁用webSecurity来解决CSP问题
      webSecurity: false
    }
  })

  meetingWindow.on('ready-to-show', () => {
    meetingWindow.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    meetingWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#${route}`)
  } else {
    meetingWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '#' + route
    })
  }
}

// async function loadVueDevTools() {
//   try {
//     const name = await installExtension(VUEJS_DEVTOOLS)
//     console.log(`Added Extension: ${name}`)
//   } catch (err) {
//     console.log('Failed to install Vue DevTools:', err)
//   }
// }

// 应用准备就绪时
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  if (is.dev) {
    // 手动加载 Vue DevTools
    session.defaultSession.extensions
      .loadExtension(
        'C:\\Users\\RaY\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Extensions\\olofadcdnkkjdfgjcmjaadnlehnnihnl\\6.6.3_0'
      )
      .then(() => {
        console.log('Vue DevTools loaded')
      })
      .catch((err) => {
        console.log('Failed to load Vue DevTools:', err)
      })
  }
  // if (is.dev) {
  //   loadVueDevTools()
  // }
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 添加监听器，用于调整窗口大小
  ipcMain.on('resize-window', (event, width, height) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    if (win) {
      win.setSize(Math.ceil(width + 40), Math.ceil(height + 40))
    }
  })

  // 添加监听器,用于调整窗口
  // 监听窗口控制指令
  ipcMain.on('window-control', (event, action) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return

    switch (action) {
      case 'minimize':
        win.minimize() // 最小化窗口
        break
      case 'close':
        win.close() // 关闭窗口
        break
    }
  })

  // IPC 处理：创建窗口
  ipcMain.handle('create-new-window', async (_event, route: string) => {
    return createNewWindow(route)
  })

  // 注册F12快捷键打开开发者工具
  globalShortcut.register('F12', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      focusedWindow.webContents.toggleDevTools()
    }
  })

  // 开启主渲染线程
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
