<template>
  <div class="data-manager">
<!--    <el-button type="info" plain @click="showManager = true">-->
<!--      <el-icon><Setting /></el-icon>-->
<!--      数据管理-->
<!--    </el-button>-->

    <el-dialog
        v-model="dialogVisible"
        title="数据管理"
        width="600px"
        @closed="handleDialogClosed"
    >
      <div class="manager-content">
        <!-- 存储状态 -->
        <div class="storage-status">
          <h3>存储状态</h3>
          <div class="status-info">
<!--            <div class="info-item">-->
<!--              <span class="label">数据位置:</span>-->
<!--              <span class="value">浏览器本地存储</span>-->
<!--            </div>-->
            <div class="info-item">
              <span class="label">进度数量:</span>
              <span class="value">{{ store.getAllProgresses.length }} 个</span>
            </div>
            <div class="info-item">
              <span class="label">最后保存:</span>
              <span class="value">{{ store.lastSaveTime || '从未保存' }}</span>
            </div>
          </div>
        </div>

        <!-- 数据操作 -->
        <div class="data-actions">
          <h3>数据操作</h3>
          <div class="action-buttons">
            <el-button type="primary" @click="handleBackup" :loading="backupLoading">
              <el-icon><Download /></el-icon>
              备份数据
            </el-button>

            <el-button @click="handleImport" :loading="importLoading">
              <el-icon><Upload /></el-icon>
              导入数据
            </el-button>

            <el-button type="danger" @click="handleClear" plain>
              <el-icon><Delete /></el-icon>
              清空数据
            </el-button>
          </div>
        </div>

        <!-- 存储说明 -->
<!--        <div class="storage-info">-->
<!--          <h3>存储说明</h3>-->
<!--          <p>数据保存在浏览器的本地存储中，不会上传到服务器。</p>-->
<!--          <p>建议定期备份数据，以防浏览器数据被清除。</p>-->
<!--          <p>重装系统或更换电脑前，请务必备份数据。</p>-->
<!--        </div>-->
      </div>

      <template #footer>
<!--        <el-button @click="showManager = false">关闭</el-button>-->
        <el-button type="primary" @click="handleManualSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 文件选择器（隐藏） -->
    <input
        type="file"
        ref="fileInput"
        accept=".json"
        @change="handleFileSelect"
        style="display: none;"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRecruitmentStore } from '../store'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataBoard,
  Document,
  Clock,
  Download,
  Upload,
  Delete,
  Refresh
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const store = useRecruitmentStore()
const fileInput = ref()
const backupLoading = ref(false)
const importLoading = ref(false)

// 使用计算属性控制对话框显示
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 添加对话框关闭处理
const handleDialogClosed = () => {
  // 可以在这里添加关闭后的清理逻辑
  console.log('数据管理对话框已关闭')
}

// 备份数据
const handleBackup = async () => {
  backupLoading.value = true
  try {
    const result = await store.backupData()
    if (result.success) {
      ElMessage.success(`数据备份成功: ${result.filename}`)
    } else {
      ElMessage.error(`备份失败: ${result.error}`)
    }
  } catch (error) {
    ElMessage.error(`备份出错: ${error.message}`)
  } finally {
    backupLoading.value = false
  }
}

// 导入数据
const handleImport = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  importLoading.value = true

  try {
    const result = await store.restoreData(file)
    if (result.success) {
      ElMessage.success('数据导入成功')
      // showManager.value = false
    } else {
      ElMessage.error(`导入失败: ${result.error}`)
    }
  } catch (error) {
    ElMessage.error(`导入出错: ${error.message}`)
  } finally {
    importLoading.value = false
    event.target.value = '' // 重置文件选择器
  }
}

// 清空数据
const handleClear = () => {
  ElMessageBox.confirm(
      '确定要清空所有数据吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
  ).then(async () => {
    const success = await store.clearAllData()
    if (success) {
      ElMessage.success('数据已清空')
      // showManager.value = false
    } else {
      ElMessage.error('清空数据失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

// 手动保存
const handleManualSave = async () => {
  try {
    const success = await store.saveToStorage()
    if (success) {
      ElMessage.success('数据保存成功')
    } else {
      ElMessage.warning('数据保存可能失败')
    }
  } catch (error) {
    ElMessage.error(`保存出错: ${error.message}`)
  }
}
</script>

<style scoped>
.manager-content {
  padding: 10px 0;
}

.storage-status,
.data-actions,
.storage-info {
  margin-bottom: 24px;
}

.storage-status h3,
.data-actions h3,
.storage-info h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.status-info {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 16px;
  border: 1px solid #e4e7ed;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  flex: 0 0 80px;
  color: #606266;
}

.info-item .value {
  flex: 1;
  color: #303133;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.storage-info {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.storage-info p {
  margin: 8px 0;
}
</style>