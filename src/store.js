import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import storage from './utils/storage'  // 导入简单存储

export const useRecruitmentStore = defineStore('recruitment', () => {
    // 状态
    const progresses = ref([])
    const isLoading = ref(false)
    const lastSaveTime = ref(null)

    // 行业选项
    const industryOptions = ref([
        '互联网',
        '制造业',
        '软件',
        '金融',
        '医疗',
        '教育',
        '能源',
        '游戏',
        '其他'
    ])

    // 结果选项
    const resultOptions = ref([
        '待投递',
        '进行中',
        '未参加',
        '招满/取消',
        '简历挂',
        '测评挂',
        '笔试挂',
        '面试挂',
        'offer',
        '已拒绝'
    ])

    // Getter
    const getAllProgresses = computed(() => progresses.value)

    const getProgressById = (id) => {
        const progress = progresses.value.find(p => p.id === id)
        if (progress) {
            return {
                ...progress,
                tags: progress.tags || [],
                records: progress.records || []
            }
        }
        return null
    }

    const getProgressRecords = (progressId) => {
        const progress = getProgressById(progressId)
        return progress ? progress.records : []
    }

    // Actions
    const createProgress = (name, description = '') => {
        const newProgress = {
            id: generateId(),
            name,
            description,
            tags: [],
            created: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            updated: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            records: []
        }

        progresses.value.push(newProgress)
        saveToStorage() // 立即保存
        return newProgress
    }

    const updateProgress = (id, data) => {
        const index = progresses.value.findIndex(p => p.id === id)
        if (index !== -1) {
            progresses.value[index] = {
                ...progresses.value[index],
                ...data,
                updated: dayjs().format('YYYY-MM-DD HH:mm:ss')
            }
            saveToStorage() // 立即保存
            return true
        }
        return false
    }

    const deleteProgress = (id) => {
        const index = progresses.value.findIndex(p => p.id === id)
        if (index !== -1) {
            progresses.value.splice(index, 1)
            saveToStorage() // 立即保存
            return true
        }
        return false
    }

    const addRecord = (progressId, recordData) => {
        const progress = getProgressById(progressId)
        if (progress) {
            const newRecord = {
                id: generateId(),
                ...recordData,
                created: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                updated: dayjs().format('YYYY-MM-DD HH:mm:ss')
            }

            if (!progress.records) {
                progress.records = []
            }

            progress.records.push(newRecord)
            progress.updated = dayjs().format('YYYY-MM-DD HH:mm:ss')
            saveToStorage() // 立即保存
            return newRecord
        }
        return null
    }

    const updateRecord = (progressId, recordId, recordData) => {
        const progress = getProgressById(progressId)
        if (progress && progress.records) {
            const recordIndex = progress.records.findIndex(r => r.id === recordId)
            if (recordIndex !== -1) {
                progress.records[recordIndex] = {
                    ...progress.records[recordIndex],
                    ...recordData,
                    updated: dayjs().format('YYYY-MM-DD HH:mm:ss')
                }
                progress.updated = dayjs().format('YYYY-MM-DD HH:mm:ss')
                saveToStorage() // 立即保存
                return true
            }
        }
        return false
    }

    const deleteRecord = (progressId, recordId) => {
        const progress = getProgressById(progressId)
        if (progress && progress.records) {
            const recordIndex = progress.records.findIndex(r => r.id === recordId)
            if (recordIndex !== -1) {
                progress.records.splice(recordIndex, 1)
                progress.updated = dayjs().format('YYYY-MM-DD HH:mm:ss')
                saveToStorage() // 立即保存
                return true
            }
        }
        return false
    }

    // 数据持久化
    const saveToStorage = async () => {
        try {
            const data = {
                progresses: progresses.value,
                lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss')
            }

            console.log('💾 正在保存数据...')
            const result = await storage.save(data)

            if (result.success) {
                lastSaveTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
                console.log('✅ 数据保存成功')
            } else {
                console.error('❌ 数据保存失败:', result.message)
            }

            return result.success
        } catch (error) {
            console.error('❌ 保存数据时出错:', error)
            return false
        }
    }

    const loadFromStorage = async () => {
        isLoading.value = true
        try {
            console.log('📂 正在加载数据...')
            const data = await storage.load()

            if (data && data.progresses) {
                progresses.value = data.progresses
                console.log(`✅ 数据加载成功，共 ${data.progresses.length} 个进度`)
            } else {
                progresses.value = []
                console.log('📭 没有找到数据，使用空数据')
            }

            // 获取存储统计
            const stats = storage.getStats()
            console.log('📊 存储统计:', stats)

        } catch (error) {
            console.error('❌ 加载数据时出错:', error)
            progresses.value = []
        } finally {
            isLoading.value = false
        }
    }

    // 手动备份数据
    const backupData = async () => {
        try {
            const result = await storage.exportData()

            if (result.success) {
                // 创建下载链接
                const a = document.createElement('a')
                a.href = result.url
                a.download = result.filename
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(result.url)

                console.log('✅ 数据备份完成')
                return { success: true, filename: result.filename }
            } else {
                console.error('❌ 数据备份失败:', result.error)
                return { success: false, error: result.error }
            }
        } catch (error) {
            console.error('❌ 备份数据时出错:', error)
            return { success: false, error: error.message }
        }
    }

    // 从文件恢复数据
    const restoreData = async (file) => {
        try {
            const result = await storage.importData(file)

            if (result.success) {
                // 重新加载数据
                await loadFromStorage()
                console.log('✅ 数据恢复成功')
                return { success: true, data: result.data }
            } else {
                console.error('❌ 数据恢复失败:', result.message)
                return { success: false, error: result.message }
            }
        } catch (error) {
            console.error('❌ 恢复数据时出错:', error)
            return { success: false, error: error.message }
        }
    }

    // 清空所有数据
    const clearAllData = async () => {
        try {
            progresses.value = []
            await storage.clear()
            console.log('✅ 数据已清空')
            return true
        } catch (error) {
            console.error('❌ 清空数据失败:', error)
            return false
        }
    }

    // 获取存储信息
    const getStorageInfo = () => {
        return storage.getStats()
    }

    // 生成唯一ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    }

    return {
        // 状态
        progresses,
        isLoading,
        lastSaveTime,

        // 选项
        industryOptions,
        resultOptions,

        // Getter
        getAllProgresses,
        getProgressById,
        getProgressRecords,

        // Actions
        createProgress,
        updateProgress,
        deleteProgress,
        addRecord,
        updateRecord,
        deleteRecord,
        saveToStorage,
        loadFromStorage,
        backupData,
        restoreData,
        clearAllData,
        getStorageInfo,

        // 工具函数（可选）
        generateId
    }
})