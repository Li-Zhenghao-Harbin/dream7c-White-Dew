const { contextBridge, ipcRenderer } = require('electron')

// 将安全的 API 暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 数据存储相关
    saveData: (data) => ipcRenderer.invoke('save-data', data),
    loadData: () => ipcRenderer.invoke('load-data'),
    deleteData: () => ipcRenderer.invoke('delete-data'),

    // 应用相关
    showContextMenu: () => ipcRenderer.invoke('show-context-menu'),

    // 监听事件
    on: (channel, callback) => {
        const validChannels = ['data-saved', 'data-loaded', 'data-deleted']
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args))
        }
    }
})