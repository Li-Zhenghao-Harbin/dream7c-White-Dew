const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

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

    // 根据环境变量加载不同的内容
    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
        // 开发环境：加载 Vite 开发服务器
        console.log('🔧 开发模式：加载 Vite 开发服务器')
        mainWindow.loadURL('http://localhost:3000')
        mainWindow.webContents.openDevTools()
    } else {
        // 生产环境：加载打包后的文件
        console.log('🚀 生产模式：加载打包文件')
        const indexPath = path.join(__dirname, '../dist/index.html')
        mainWindow.loadFile(indexPath)
    }

    // 页面加载完成后显示窗口
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

// 当 Electron 初始化完成时创建窗口
app.whenReady().then(() => {
    console.log('✅ Electron app 准备就绪')
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
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// IPC 通信处理
ipcMain.handle('save-data', async (event, data) => {
    try {
        const userDataPath = app.getPath('userData')
        const filePath = path.join(userDataPath, 'recruitment-data.json')
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
        return { success: true, path: filePath }
    } catch (error) {
        console.error('❌ 保存数据失败:', error)
        return { success: false, error: error.message }
    }
})

ipcMain.handle('load-data', async () => {
    try {
        const userDataPath = app.getPath('userData')
        const filePath = path.join(userDataPath, 'recruitment-data.json')

        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8')
            return JSON.parse(data)
        }
        return { progresses: [], lastUpdated: new Date().toISOString() }
    } catch (error) {
        console.error('❌ 加载数据失败:', error)
        return { progresses: [], lastUpdated: new Date().toISOString() }
    }
})

ipcMain.handle('delete-data', async () => {
    try {
        const userDataPath = app.getPath('userData')
        const filePath = path.join(userDataPath, 'recruitment-data.json')

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            return { success: true }
        }
        return { success: false, message: '文件不存在' }
    } catch (error) {
        console.error('❌ 删除数据失败:', error)
        return { success: false, error: error.message }
    }
})

// 处理应用菜单
ipcMain.handle('show-context-menu', (event) => {
    const { Menu, MenuItem } = require('electron')

    const menu = new Menu()
    menu.append(new MenuItem({
        label: '刷新',
        click: () => {
            mainWindow.reload()
        }
    }))
    menu.append(new MenuItem({
        label: '开发者工具',
        click: () => {
            mainWindow.webContents.openDevTools()
        }
    }))

    menu.popup()
})