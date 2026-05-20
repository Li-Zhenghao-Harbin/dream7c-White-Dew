// 最简单的存储模块，完全不依赖 IPC
import dayjs from 'dayjs'

class SimpleStorage {
    constructor() {
        // 存储键名
        this.STORAGE_KEY = 'white_dew_data'
        // 版本号，用于数据迁移
        this.DATA_VERSION = '1.0.0'

        console.log('📦 初始化简单存储模块')
        console.log('🔑 存储键名:', this.STORAGE_KEY)
        console.log('📊 数据版本:', this.DATA_VERSION)
    }

    /**
     * 保存数据到 localStorage
     * 这是最简单最可靠的方式
     */
    save(data) {
        return new Promise((resolve) => {
            try {
                console.log('💾 开始保存数据...')

                // 创建简单的数据对象，确保没有复杂对象
                const saveData = {
                    version: this.DATA_VERSION,
                    lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    progresses: JSON.parse(JSON.stringify(data.progresses || [])),
                    interviewExperiences: JSON.parse(JSON.stringify(data.interviewExperiences || []))
                }

                console.log('📝 数据内容:', {
                    进度数量: saveData.progresses.length,
                    最后更新: saveData.lastUpdated
                })

                // 转换为 JSON 字符串
                const jsonString = JSON.stringify(saveData)
                console.log('📄 JSON 字符串长度:', jsonString.length)

                // 保存到 localStorage
                localStorage.setItem(this.STORAGE_KEY, jsonString)

                console.log('✅ 数据保存成功')
                resolve({ success: true, message: '数据保存成功' })

                // 可选：同时尝试保存到文件（如果可用）
                this.trySaveToFile(saveData).catch(fileError => {
                    console.warn('⚠️  文件保存失败，但本地存储已保存:', fileError)
                })

            } catch (error) {
                console.error('❌ 保存数据失败:', error)
                resolve({ success: false, message: `保存失败: ${error.message}` })
            }
        })
    }

    /**
     * 从 localStorage 加载数据
     */
    load() {
        return new Promise((resolve) => {
            try {
                console.log('📂 开始加载数据...')

                // 从 localStorage 加载
                const jsonString = localStorage.getItem(this.STORAGE_KEY)

                if (!jsonString) {
                    console.log('📭 没有找到存储的数据')
                    resolve(this.getEmptyData())
                    return
                }

                console.log('📄 找到存储的数据，长度:', jsonString.length)

                // 解析 JSON
                const data = JSON.parse(jsonString)

                // 验证数据格式
                if (!data.progresses || !Array.isArray(data.progresses)) {
                    console.warn('⚠️  数据格式不正确，使用空数据')
                    resolve(this.getEmptyData())
                    return
                }

                console.log(`✅ 数据加载成功，共 ${data.progresses.length} 个进度`)

                resolve(data)

            } catch (error) {
                console.error('❌ 加载数据失败:', error)
                resolve(this.getEmptyData())
            }
        })
    }

    /**
     * 获取空数据模板
     */
    getEmptyData() {
        return {
            version: this.DATA_VERSION,
            lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            progresses: [],
            interviewExperiences: []
        }
    }

    /**
     * 清理所有数据
     */
    clear() {
        return new Promise((resolve) => {
            try {
                localStorage.removeItem(this.STORAGE_KEY)
                console.log('🗑️  已清理所有数据')
                resolve({ success: true })
            } catch (error) {
                console.error('清理数据失败:', error)
                resolve({ success: false, error: error.message })
            }
        })
    }

    /**
     * 导出数据为 JSON 文件
     */
    exportData() {
        return new Promise((resolve) => {
            this.load().then(data => {
                try {
                    const jsonString = JSON.stringify(data, null, 2)
                    const blob = new Blob([jsonString], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const filename = `白露_${dayjs().format('YYYYMMDD_HHmmss')}.json`

                    resolve({
                        success: true,
                        data: data,
                        blob: blob,
                        url: url,
                        filename: filename
                    })
                } catch (error) {
                    console.error('导出数据失败:', error)
                    resolve({ success: false, error: error.message })
                }
            })
        })
    }

    /**
     * 从 JSON 文件导入数据
     */
    importData(file) {
        return new Promise((resolve) => {
            try {
                const reader = new FileReader()

                reader.onload = (event) => {
                    try {
                        const jsonString = event.target.result
                        const data = JSON.parse(jsonString)

                        // 验证数据格式
                        if (!data.progresses || !Array.isArray(data.progresses)) {
                            resolve({
                                success: false,
                                message: '数据格式不正确，必须包含 progresses 数组'
                            })
                            return
                        }

                        // 保存导入的数据
                        this.save(data).then(saveResult => {
                            resolve({
                                success: saveResult.success,
                                data: data,
                                message: saveResult.message
                            })
                        })

                    } catch (parseError) {
                        console.error('解析导入文件失败:', parseError)
                        resolve({
                            success: false,
                            message: `解析文件失败: ${parseError.message}`
                        })
                    }
                }

                reader.onerror = (error) => {
                    console.error('读取文件失败:', error)
                    resolve({
                        success: false,
                        message: `读取文件失败: ${error.message}`
                    })
                }

                reader.readAsText(file)

            } catch (error) {
                console.error('导入数据失败:', error)
                resolve({
                    success: false,
                    message: `导入失败: ${error.message}`
                })
            }
        })
    }

    /**
     * 尝试保存到文件（如果可用）
     */
    async trySaveToFile(data) {
        // 首先检查 electronAPI 是否存在
        if (!window.electronAPI) {
            console.log('📝 Electron API 不可用，跳过文件保存')
            return { success: false, message: 'Electron API 不可用' }
        }

        // 检查 saveData 方法是否存在
        if (typeof window.electronAPI.saveData !== 'function') {
            console.log('📝 Electron API.saveData 不是函数，跳过文件保存')
            return { success: false, message: 'saveData 方法不可用' }
        }

        try {
            console.log('💾 尝试保存到文件系统...')
            const result = await window.electronAPI.saveData(data)

            if (result && result.success) {
                console.log('✅ 文件保存成功:', result.path)
                return result
            } else {
                console.warn('⚠️  文件保存返回失败:', result)
                return {
                    success: false,
                    message: result?.message || '文件保存失败',
                    error: result?.error
                }
            }
        } catch (error) {
            console.warn('⚠️  文件保存失败:', error)
            return {
                success: false,
                error: error.message,
                message: '文件保存异常'
            }
        }
    }


    /**
     * 获取存储统计信息
     */
    getStats() {
        try {
            const jsonString = localStorage.getItem(this.STORAGE_KEY)
            const hasData = !!jsonString

            if (hasData) {
                const data = JSON.parse(jsonString)
                return {
                    hasData: true,
                    dataSize: jsonString.length,
                    progressCount: data.progresses.length,
                    lastUpdated: data.lastUpdated,
                    version: data.version
                }
            }

            return {
                hasData: false,
                dataSize: 0,
                progressCount: 0,
                lastUpdated: null,
                version: null
            }

        } catch (error) {
            console.error('获取统计信息失败:', error)
            return {
                hasData: false,
                dataSize: 0,
                progressCount: 0,
                lastUpdated: null,
                version: null,
                error: error.message
            }
        }
    }

    /**
     * 数据迁移（如果需要）
     */
    migrateData() {
        // 这里可以添加数据迁移逻辑
        console.log('🔄 检查数据迁移...')
        return Promise.resolve({ success: true, migrated: false })
    }
}

// 创建存储实例
const storage = new SimpleStorage()

// 暴露到全局，方便调试
if (typeof window !== 'undefined') {
    window.whiteDewStorage = storage
    console.log('🔧 存储模块已暴露到 window.whiteDewStorage')
}

export default storage
