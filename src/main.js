const { app, BrowserWindow } = require('electron')
const path = require('path')

console.log('🚀 启动 Electron 应用...')

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        show: false,
        icon: path.join(__dirname, '../build/icon.ico')
    })

    // 设置应用标题
    mainWindow.setTitle('White Dew - 招聘信息管理')

    // 开发环境
    if (process.env.NODE_ENV === 'development') {
        console.log('🔧 开发模式：加载 Vite 开发服务器')
        mainWindow.loadURL('http://localhost:3000')
        mainWindow.webContents.openDevTools()
    } else {
        // 生产环境
        console.log('🚀 生产模式：加载打包文件')
        const indexPath = path.join(__dirname, '../dist/index.html')
        mainWindow.loadFile(indexPath)
    }

    // 页面加载完成后显示窗口
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
        console.log('✅ 窗口已显示')
    })

    mainWindow.on('closed', () => {
        mainWindow = null
        console.log('🔌 窗口已关闭')
    })
}

// 当 Electron 初始化完成时创建窗口
app.whenReady().then(() => {
    console.log('✅ Electron app 准备就绪')
    console.log('📁 用户数据目录:', app.getPath('userData'))
    console.log('📁 应用数据目录:', app.getPath('appData'))

    createWindow()

    // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，重新创建一个窗口
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// 在所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
    console.log('👋 所有窗口已关闭，退出应用')
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// 注意：我们不在这里定义 IPC 处理器
// 因为存储主要依赖 localStorage
// 文件存储是可选功能