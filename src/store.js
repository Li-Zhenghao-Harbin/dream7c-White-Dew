import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export const useRecruitmentStore = defineStore('recruitment', () => {
    // 状态
    const progresses = ref([])
    const isLoading = ref(false)

    // 行业选项
    const industryOptions = ref([
        '互联网',
        '金融',
        '制造业',
        '医疗',
        '教育',
        '零售',
        '房地产',
        '能源',
        '交通运输',
        '娱乐媒体',
        '其他'
    ])

    // 结果选项
    const resultOptions = ref([
        '未参加',
        '简历挂',
        '测评挂',
        '笔试挂',
        '一面挂',
        '二面挂',
        '三面挂',
        'HR面挂',
        'offer',
        '已拒绝',
        '进行中'
    ])

    // Getter
    const getAllProgresses = computed(() => progresses.value)

    const getProgressById = (id) => {
        const progress = progresses.value.find(p => p.id === id)
        if (progress) {
            // 确保 progress 有所有必需的字段
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
    // 在 createProgress 函数中，确保有 tags 字段
    const createProgress = (name, description = '') => {
        const newProgress = {
            id: generateId(),
            name,
            description,
            tags: [],  // 确保有 tags 字段
            created: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            updated: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            records: []
        }

        progresses.value.push(newProgress)
        saveToStorage()
        return newProgress
    }

    const updateProgress = (id, data) => {
        const index = progresses.value.findIndex(p => p.id === id)
        if (index !== -1) {
            progresses.value[index] = {
                ...progresses.value[index],
                ...data,
                // 确保 tags 存在
                tags: data.tags || progresses.value[index].tags || [],
                updated: dayjs().format('YYYY-MM-DD HH:mm:ss')
            }
            saveToStorage()
            return true
        }
        return false
    }

    const deleteProgress = (id) => {
        const index = progresses.value.findIndex(p => p.id === id)
        if (index !== -1) {
            progresses.value.splice(index, 1)
            saveToStorage()
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
            saveToStorage()
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
                saveToStorage()
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
                saveToStorage()
                return true
            }
        }
        return false
    }

    const addStageToRecord = (progressId, recordId, stage) => {
        const progress = getProgressById(progressId)
        if (progress && progress.records) {
            const record = progress.records.find(r => r.id === recordId)
            if (record) {
                if (!record.currentStage) {
                    record.currentStage = []
                }

                record.currentStage.push({
                    id: generateId(),
                    name: stage.name,
                    date: stage.date,
                    notes: stage.notes || ''
                })

                record.updated = dayjs().format('YYYY-MM-DD HH:mm:ss')
                progress.updated = dayjs().format('YYYY-MM-DD HH:mm:ss')
                saveToStorage()
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

            if (window.electronAPI) {
                const result = await window.electronAPI.saveData(data)
                if (result.success) {
                    console.log('✅ 数据保存成功')
                } else {
                    console.error('❌ 数据保存失败:', result.error)
                }
            } else {
                // 开发环境使用 localStorage
                localStorage.setItem('recruitment-data', JSON.stringify(data))
                console.log('✅ 数据保存到 localStorage')
            }
        } catch (error) {
            console.error('❌ 保存数据时出错:', error)
        }
    }

    const loadFromStorage = async () => {
        isLoading.value = true
        try {
            let data

            if (window.electronAPI) {
                data = await window.electronAPI.loadData()
            } else {
                // 开发环境使用 localStorage
                const stored = localStorage.getItem('recruitment-data')
                data = stored ? JSON.parse(stored) : null
            }

            if (data && data.progresses) {
                progresses.value = data.progresses
                console.log('✅ 数据加载成功，共', data.progresses.length, '个进度')
            } else {
                progresses.value = []
                console.log('📁 没有找到数据，使用空数据')
            }
        } catch (error) {
            console.error('❌ 加载数据时出错:', error)
            progresses.value = []
        } finally {
            isLoading.value = false
        }
    }

    // 生成唯一ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }

    return {
        // 状态
        progresses,
        isLoading,

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
        addStageToRecord,
        saveToStorage,
        loadFromStorage
    }
})