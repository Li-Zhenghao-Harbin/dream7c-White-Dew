const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')

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
    mainWindow.setTitle('柒幻 白露')
    mainWindow.setMenu(null);

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

// 获取数据存储路径
function getDataPath() {
    const userDataPath = app.getPath('userData')
    const dataPath = path.join(userDataPath, 'white_dew_data.json')
    console.log('📁 数据文件路径:', dataPath)
    return dataPath
}

// 简单的数据保存函数
function saveDataToFile(data) {
    try {
        const filePath = getDataPath()
        console.log('💾 保存数据到文件:', filePath)

        // 确保数据是纯对象，没有函数或不可序列化的东西
        const cleanData = JSON.parse(JSON.stringify(data))

        // 创建备份
        const backupDir = path.join(path.dirname(filePath), 'backups')
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true })
        }

        const backupPath = path.join(backupDir, `backup_${Date.now()}.json`)

        // 如果文件已存在，先备份
        if (fs.existsSync(filePath)) {
            try {
                fs.copyFileSync(filePath, backupPath)
                console.log('📦 创建备份文件:', backupPath)
            } catch (backupError) {
                console.warn('⚠️  创建备份失败:', backupError.message)
            }
        }

        // 写入新数据
        fs.writeFileSync(filePath, JSON.stringify(cleanData, null, 2), 'utf-8')

        console.log('✅ 文件保存成功')

        // 清理旧的备份文件（保留最近5个）
        try {
            const backupFiles = fs.readdirSync(backupDir)
                .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
                .map(f => path.join(backupDir, f))
                .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime())

            if (backupFiles.length > 5) {
                for (let i = 5; i < backupFiles.length; i++) {
                    fs.unlinkSync(backupFiles[i])
                }
                console.log(`🧹 清理了 ${backupFiles.length - 5} 个旧备份`)
            }
        } catch (cleanupError) {
            console.warn('⚠️  清理备份文件失败:', cleanupError.message)
        }

        return {
            success: true,
            path: filePath,
            backupPath: backupPath,
            message: '数据保存成功'
        }
    } catch (error) {
        console.error('❌ 保存文件失败:', error)
        return {
            success: false,
            error: error.message,
            message: '数据保存失败'
        }
    }
}

// 从文件加载数据
function loadDataFromFile() {
    try {
        const filePath = getDataPath()
        console.log('📂 从文件加载数据:', filePath)

        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8')
            console.log('✅ 找到数据文件，大小:', data.length, '字节')

            try {
                const parsed = JSON.parse(data)

                // 验证数据格式
                if (parsed && typeof parsed === 'object' && parsed.progresses && Array.isArray(parsed.progresses)) {
                    console.log(`📊 数据包含 ${parsed.progresses.length} 个进度`)
                    return parsed
                } else {
                    console.warn('⚠️  数据格式不正确，使用空数据')
                    return { progresses: [], lastUpdated: new Date().toISOString() }
                }
            } catch (parseError) {
                console.error('❌ 解析 JSON 失败:', parseError)

                // 尝试从备份恢复
                const backupDir = path.join(path.dirname(filePath), 'backups')
                if (fs.existsSync(backupDir)) {
                    const backupFiles = fs.readdirSync(backupDir)
                        .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
                        .map(f => path.join(backupDir, f))
                        .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime())

                    if (backupFiles.length > 0) {
                        console.log('🔄 尝试从备份恢复数据...')
                        try {
                            const backupData = fs.readFileSync(backupFiles[0], 'utf-8')
                            const parsedBackup = JSON.parse(backupData)

                            // 恢复备份
                            fs.writeFileSync(filePath, backupData, 'utf-8')
                            console.log('✅ 从备份恢复成功')
                            return parsedBackup
                        } catch (restoreError) {
                            console.error('❌ 从备份恢复失败:', restoreError)
                        }
                    }
                }

                return { progresses: [], lastUpdated: new Date().toISOString() }
            }
        } else {
            console.log('📁 数据文件不存在，返回空数据')
            return { progresses: [], lastUpdated: new Date().toISOString() }
        }
    } catch (error) {
        console.error('❌ 加载文件失败:', error)
        return { progresses: [], lastUpdated: new Date().toISOString() }
    }
}

// 当 Electron 初始化完成时创建窗口
app.whenReady().then(() => {
    console.log('✅ Electron app 准备就绪')
    console.log('🏠 用户数据目录:', app.getPath('userData'))
    console.log('📁 文档目录:', app.getPath('documents'))

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

// IPC 通信处理器 - 必须要有这个！
ipcMain.handle('save-data', async (event, data) => {
    console.log('📨 收到保存数据请求')
    console.log('📦 数据大小:', JSON.stringify(data).length, '字节')

    const result = saveDataToFile(data)
    console.log('📤 保存结果:', result.success ? '成功' : '失败')
    return result
})

ipcMain.handle('load-data', async () => {
    console.log('📨 收到加载数据请求')
    const data = loadDataFromFile()
    console.log('📥 加载结果:', data.progresses ? `${data.progresses.length} 个进度` : '无数据')
    return data
})

// 额外的 IPC 处理器，用于获取应用信息
ipcMain.handle('get-app-info', async () => {
    return {
        version: app.getVersion(),
        name: app.getName(),
        platform: process.platform,
        dataPath: getDataPath(),
        userDataPath: app.getPath('userData'),
        isPackaged: app.isPackaged
    }
})

// 打开数据文件所在目录
ipcMain.handle('open-data-folder', async () => {
    const dataPath = getDataPath()
    const dirPath = path.dirname(dataPath)

    return new Promise((resolve) => {
        let command
        switch (process.platform) {
            case 'win32':
                command = `explorer "${dirPath}"`
                break
            case 'darwin':
                command = `open "${dirPath}"`
                break
            case 'linux':
                command = `xdg-open "${dirPath}"`
                break
            default:
                resolve({ success: false, error: '不支持的操作系统' })
                return
        }

        exec(command, (error) => {
            if (error) {
                console.error('❌ 打开目录失败:', error)
                resolve({ success: false, error: error.message })
            } else {
                console.log('✅ 已打开数据目录:', dirPath)
                resolve({ success: true, path: dirPath })
            }
        })
    })
})

console.log('🔧 IPC 处理器已注册')