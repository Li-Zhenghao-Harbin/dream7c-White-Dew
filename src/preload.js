const { contextBridge, ipcRenderer } = require('electron')

console.log('🔧 Preload script 加载中...')

// 安全的 IPC 调用包装器
function createSafeIpcHandler(channel) {
    return (data) => {
        return new Promise((resolve) => {
            try {
                // 确保数据是可序列化的
                const serializableData = JSON.parse(JSON.stringify(data || {}))

                console.log(`🎯 调用 ${channel}，数据大小:`, JSON.stringify(serializableData).length)

                ipcRenderer.invoke(channel, serializableData)
                    .then(result => {
                        console.log(`✅ ${channel} 成功:`, result)
                        resolve(result)
                    })
                    .catch(error => {
                        console.error(`❌ ${channel} 失败:`, error)
                        resolve({
                            success: false,
                            error: error.message,
                            message: `IPC 调用失败: ${channel}`
                        })
                    })
            } catch (error) {
                console.error(`❌ 准备 ${channel} 数据失败:`, error)
                resolve({
                    success: false,
                    error: error.message,
                    message: '数据序列化失败'
                })
            }
        })
    }
}

// 暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 数据存储
    saveData: createSafeIpcHandler('save-data'),
    loadData: () => {
        console.log('📂 调用 loadData')
        return ipcRenderer.invoke('load-data')
            .then(result => result)
            .catch(error => {
                console.error('❌ loadData 失败:', error)
                return { progresses: [], lastUpdated: new Date().toISOString() }
            })
    },

    // 应用信息
    getAppInfo: () => {
        console.log('ℹ️  获取应用信息')
        return ipcRenderer.invoke('get-app-info')
            .then(result => result)
            .catch(error => {
                console.error('❌ 获取应用信息失败:', error)
                return {
                    version: '未知',
                    name: 'White Dew',
                    platform: process.platform,
                    isPackaged: false
                }
            })
    },

    // 工具函数
    openDataFolder: () => {
        console.log('📁 打开数据目录')
        return ipcRenderer.invoke('open-data-folder')
            .then(result => result)
            .catch(error => {
                console.error('❌ 打开数据目录失败:', error)
                return { success: false, error: error.message }
            })
    }
})

// 暴露简单的测试函数
contextBridge.exposeInMainWorld('electronUtils', {
    testConnection: () => {
        console.log('🔗 测试 Electron 连接')
        return 'Electron 连接正常'
    },

    ping: () => {
        return 'pong'
    }
})

console.log('✅ Preload script 加载完成，API 已暴露')