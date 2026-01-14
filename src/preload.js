const { contextBridge, ipcRenderer } = require('electron')

console.log('🔧 Preload script 加载中...')

// 暴露非常简单的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 只有必要的 API
    saveData: (data) => {
        try {
            // 确保数据是纯对象
            const cleanData = JSON.parse(JSON.stringify(data))
            console.log('💾 尝试保存到文件，数据大小:', JSON.stringify(cleanData).length)
            return ipcRenderer.invoke('save-data', cleanData)
        } catch (error) {
            console.error('❌ 准备保存数据时出错:', error)
            return Promise.resolve({ success: false, error: error.message })
        }
    },

    loadData: () => {
        console.log('📂 尝试从文件加载数据')
        return ipcRenderer.invoke('load-data')
    }
})

// 暴露存储测试函数
contextBridge.exposeInMainWorld('electronUtils', {
    testConnection: () => {
        console.log('🔗 测试 Electron 连接')
        return 'Electron 连接正常'
    },

    getAppInfo: () => {
        return {
            platform: process.platform,
            electron: true,
            timestamp: Date.now()
        }
    }
})

console.log('✅ Preload script 加载完成')