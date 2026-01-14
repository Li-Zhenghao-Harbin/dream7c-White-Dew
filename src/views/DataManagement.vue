<template>
  <div class="data-management">
    <div class="page-header">
      <el-button type="text" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>数据管理</h1>
    </div>

    <div class="management-content">
      <!-- 当前数据状态 -->
      <el-card class="data-status-card" shadow="never">
        <template #header>
          <div class="card-header">
            <h3>数据状态</h3>
          </div>
        </template>

        <div class="data-info">
          <div class="info-item">
            <el-icon><DataBoard /></el-icon>
            <div class="info-content">
              <span class="info-label">进度数量</span>
              <span class="info-value">{{ store.getAllProgresses.length }} 个</span>
            </div>
          </div>

          <div class="info-item">
            <el-icon><Document /></el-icon>
            <div class="info-content">
              <span class="info-label">总记录数</span>
              <span class="info-value">{{ totalRecords }} 条</span>
            </div>
          </div>

          <div class="info-item">
            <el-icon><Clock /></el-icon>
            <div class="info-content">
              <span class="info-label">数据位置</span>
              <span class="info-value">
                {{ isElectron ? '本地文件' : '浏览器存储' }}
              </span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 数据操作 -->
      <div class="data-actions">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card shadow="hover" class="action-card">
              <div class="action-content" @click="handleBackup">
                <el-icon size="48" color="#409EFF"><Download /></el-icon>
                <h3>备份数据</h3>
                <p>将当前数据导出为 JSON 文件</p>
              </div>
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card shadow="hover" class="action-card">
              <div class="action-content" @click="handleImport">
                <el-icon size="48" color="#67C23A"><Upload /></el-icon>
                <h3>导入数据</h3>
                <p>从 JSON 文件恢复数据</p>
              </div>
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card shadow="hover" class="action-card">
              <div class="action-content" @click="handleClear">
                <el-icon size="48" color="#E6A23C"><Delete /></el-icon>
                <h3>清空数据</h3>
                <p>删除所有进度和记录</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 数据文件信息 -->
      <el-card class="file-info-card" shadow="never" v-if="isElectron">
        <template #header>
          <div class="card-header">
            <h3>文件信息</h3>
            <el-button type="text" @click="refreshFileInfo">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
        </template>

        <div class="file-info" v-if="fileInfo">
          <div class="info-row">
            <span class="label">文件路径:</span>
            <span class="value">{{ fileInfo.path }}</span>
          </div>
          <div class="info-row">
            <span class="label">文件大小:</span>
            <span class="value">{{ formatFileSize(fileInfo.size) }}</span>
          </div>
          <div class="info-row">
            <span class="label">最后修改:</span>
            <span class="value">{{ fileInfo.modified }}</span>
          </div>
        </div>

        <div class="file-info" v-else>
          <el-empty description="无法获取文件信息" />
        </div>
      </el-card>
    </div>

    <!-- 导入对话框 -->
    <input
        type="file"
        ref="fileInput"
        accept=".json"
        @change="handleFileSelected"
        style="display: none;"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRecruitmentStore } from '../store'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  DataBoard,
  Document,
  Clock,
  Download,
  Upload,
  Delete,
  Refresh
} from '@element-plus/icons-vue'

const router = useRouter()
const store = useRecruitmentStore()
const fileInput = ref()
const fileInfo = ref(null)

const isElectron = computed(() => {
  return typeof window !== 'undefined' && window.electronAPI
})

const totalRecords = computed(() => {
  return store.getAllProgresses.reduce((total, progress) => {
    return total + (progress.records ? progress.records.length : 0)
  }, 0)
})

onMounted(() => {
  if (isElectron.value) {
    loadFileInfo()
  }
})

const goBack = () => {
  router.push('/')
}

const handleBackup = async () => {
  try {
    const success = await store.backupData()
    if (success) {
      ElMessage.success('数据备份成功，文件已下载')
    } else {
      ElMessage.error('数据备份失败')
    }
  } catch (error) {
    console.error('备份失败:', error)
    ElMessage.error('数据备份失败: ' + error.message)
  }
}

const handleImport = () => {
  fileInput.value.click()
}

const handleFileSelected = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!data.progresses) {
      ElMessage.error('无效的数据文件')
      return
    }

    ElMessageBox.confirm(
        `确定要导入数据吗？这将覆盖当前的所有数据，包含 ${data.progresses.length} 个进度。`,
        '确认导入',
        {
          confirmButtonText: '确定导入',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(async () => {
      const success = await store.restoreData(data)
      if (success) {
        ElMessage.success('数据导入成功')
      } else {
        ElMessage.error('数据导入失败')
      }
    }).catch(() => {
      // 用户取消
    })
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败: ' + error.message)
  } finally {
    event.target.value = ''
  }
}

const handleClear = () => {
  ElMessageBox.confirm(
      '确定要清空所有数据吗？此操作不可恢复！',
      '确认清空',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
  ).then(async () => {
    store.progresses = []
    await store.saveToStorage()
    ElMessage.success('数据已清空')
  }).catch(() => {
    // 用户取消
  })
}

const loadFileInfo = async () => {
  if (!isElectron.value) return

  try {
    const data = await store.loadFromStorage()
    // 这里可以添加更多文件信息
    fileInfo.value = {
      path: 'Electron 用户数据目录/WhiteDewData/recruitment-data.json',
      size: JSON.stringify(data).length,
      modified: new Date().toLocaleString()
    }
  } catch (error) {
    console.error('获取文件信息失败:', error)
  }
}

const refreshFileInfo = () => {
  loadFileInfo()
  ElMessage.success('文件信息已刷新')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.data-management {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.page-header h1 {
  margin: 0;
  color: #2d3748;
  font-size: 28px;
}

.management-content {
  max-width: 1200px;
  margin: 0 auto;
}

.data-status-card,
.file-info-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #2d3748;
}

.data-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-item .el-icon {
  font-size: 24px;
  color: #409EFF;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-label {
  color: #718096;
  font-size: 14px;
  margin-bottom: 4px;
}

.info-value {
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
}

.data-actions {
  margin-bottom: 32px;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.action-card:hover {
  transform: translateY(-4px);
}

.action-content {
  text-align: center;
  padding: 32px 16px;
}

.action-content h3 {
  margin: 16px 0 8px;
  color: #2d3748;
}

.action-content p {
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
}

.file-info {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-row {
  display: flex;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e2e8f0;
}

.info-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.info-row .label {
  flex: 0 0 100px;
  color: #718096;
  font-size: 14px;
}

.info-row .value {
  flex: 1;
  color: #2d3748;
  font-size: 14px;
  word-break: break-all;
}
</style>