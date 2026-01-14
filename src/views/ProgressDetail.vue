<template>
  <div class="progress-detail" v-loading="loading">
    <!-- 头部 -->
    <div class="detail-header">
      <div class="header-content">
        <div class="back-button">
          <el-button type="text" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>

        <div class="header-main">
          <h1 class="progress-title">
            <el-icon><Folder /></el-icon>
            {{ progress?.name || '加载中...' }}
          </h1>

          <div class="progress-meta">
            <div class="meta-item" v-if="progress?.description">
              <el-icon><Document /></el-icon>
              <span>{{ progress.description }}</span>
            </div>

            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>创建时间: {{ progress?.created || '' }}</span>
            </div>

            <div class="meta-item">
              <el-icon><Refresh /></el-icon>
              <span>更新时间: {{ progress?.updated || '' }}</span>
            </div>

            <!-- 标签部分，确保 progress.tags 存在 -->
            <div class="tags-section" v-if="progress?.tags && progress.tags.length > 0">
              <el-tag
                  v-for="tag in progress.tags"
                  :key="tag"
                  size="small"
                  type="info"
                  class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="tags-section" v-else>
              <el-tag size="small" type="info">无标签</el-tag>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <el-dropdown @command="handleAction">
            <el-button type="primary">
              操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="add-record">
                  <el-icon><Plus /></el-icon>添加记录
                </el-dropdown-item>
                <el-dropdown-item command="edit-progress">
                  <el-icon><Edit /></el-icon>编辑进度
                </el-dropdown-item>
                <el-dropdown-item command="export-data">
                  <el-icon><Download /></el-icon>导出数据
                </el-dropdown-item>
                <el-dropdown-item divided command="delete-progress">
                  <el-icon><Delete /></el-icon>删除进度
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 统计数据 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="总记录数" :value="totalRecords">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="进行中" :value="inProgressCount">
            <template #prefix>
              <el-icon><Clock /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="已通过" :value="passedCount">
            <template #prefix>
              <el-icon><SuccessFilled /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="已拒绝" :value="rejectedCount">
            <template #prefix>
              <el-icon><CloseBold /></el-icon>
            </template>
          </el-statistic>
        </el-col>
      </el-row>
    </div>

    <!-- 记录表格 -->
    <div class="records-section">
      <div class="section-header">
        <h2>招聘记录</h2>
        <div class="section-actions">
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>添加记录
          </el-button>
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
          :data="records"
          style="width: 100%"
          stripe
          border
          size="large"
          empty-text="暂无记录，点击上方按钮添加"
      >
        <el-table-column prop="companyName" label="公司名称" width="180" fixed />
        <el-table-column prop="industry" label="行业" width="120">
          <template #default="scope">
            <el-tag :type="getIndustryTagType(scope.row.industry)">
              {{ scope.row.industry }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="position" label="岗位" width="150" />
        <el-table-column prop="applyDate" label="投递日期" width="120" sortable />

        <el-table-column prop="currentStage" label="当前进度" min-width="200">
          <template #default="scope">
            <div v-if="scope.row.currentStage && scope.row.currentStage.length > 0" class="stages">
              <el-tag
                  v-for="stage in scope.row.currentStage.slice(0, 2)"
                  :key="stage.id"
                  size="small"
                  class="stage-tag"
              >
                {{ stage.name }} {{ stage.date }}
              </el-tag>
              <el-tag v-if="scope.row.currentStage.length > 2" size="small">
                +{{ scope.row.currentStage.length - 2 }}
              </el-tag>
            </div>
            <span v-else class="no-stages">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="result" label="结果" width="100" fixed="right">
          <template #default="scope">
            <el-tag :type="getResultTagType(scope.row.result)" size="small">
              {{ scope.row.result }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="salary" label="待遇" width="120" />
        <el-table-column prop="note" label="备注" width="150" show-overflow-tooltip />
        <el-table-column prop="website" label="官网" width="150">
          <template #default="scope">
            <a v-if="scope.row.website" :href="scope.row.website" target="_blank" @click.stop>
              访问
            </a>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                  type="text"
                  size="small"
                  @click.stop="editRecord(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                  type="text"
                  size="small"
                  @click.stop="deleteRecord(scope.row.id)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑记录对话框 -->
    <el-dialog
        v-model="showAddDialog"
        :title="isEditing ? '编辑记录' : '添加新记录'"
        width="800px"
    >
      <RecordForm
          v-if="showAddDialog"
          :record="currentRecord"
          @submit="handleRecordSubmit"
          @cancel="showAddDialog = false"
      />
    </el-dialog>

    <!-- 编辑进度对话框 -->
    <el-dialog
        v-model="showEditProgressDialog"
        title="编辑进度"
        width="500px"
    >
      <el-form
          ref="editProgressFormRef"
          :model="editProgressForm"
          :rules="editProgressRules"
          label-width="100px"
      >
        <el-form-item label="进度名称" prop="name">
          <el-input v-model="editProgressForm.name" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
              v-model="editProgressForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入进度描述"
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-select
              v-model="editProgressForm.tags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="选择或输入标签"
              style="width: 100%;"
          >
            <el-option
                v-for="tag in allTags"
                :key="tag"
                :label="tag"
                :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditProgressDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProgressEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRecruitmentStore } from '../store'
import { ElMessage, ElMessageBox } from 'element-plus'
import RecordForm from '../components/RecordForm.vue'
import {
  ArrowLeft,
  Folder,
  Document,
  Calendar,
  Refresh,
  ArrowDown,
  Plus,
  Edit,
  Download,
  Delete,
  Clock,
  SuccessFilled,
  CloseBold
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const store = useRecruitmentStore()

const progressId = route.params.id
const loading = ref(false)
const showAddDialog = ref(false)
const showEditProgressDialog = ref(false)
const isEditing = ref(false)
const currentRecord = ref(null)
const editProgressFormRef = ref()

// 编辑进度表单
const editProgressForm = ref({
  name: '',
  description: '',
  tags: []
})

const editProgressRules = {
  name: [
    { required: true, message: '请输入进度名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

const allTags = [
  '秋招', '春招', '暑期实习', '日常实习', '社招',
  '互联网专场', '金融专场', '国企专场', '海外招聘',
  '紧急', '重点', '已完结'
]

// 计算属性
const progress = computed(() => {
  return store.getProgressById(progressId)
})

const records = computed(() => {
  return store.getProgressRecords(progressId)
})

const totalRecords = computed(() => {
  return records.value.length
})

const inProgressCount = computed(() => {
  return records.value.filter(record => record.result === '进行中').length
})

const passedCount = computed(() => {
  return records.value.filter(record => record.result === 'offer').length
})

const rejectedCount = computed(() => {
  const rejectedResults = ['简历挂', '测评挂', '笔试挂', '一面挂', '二面挂', '三面挂', 'HR面挂', '已拒绝']
  return records.value.filter(record => rejectedResults.includes(record.result)).length
})

// 生命周期
onMounted(() => {
  loadProgress()
})

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadProgress()
  }
})

// 方法
const loadProgress = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const goBack = () => {
  router.push('/')
}

const refreshData = () => {
  loadProgress()
  ElMessage.success('数据已刷新')
}

const getIndustryTagType = (industry) => {
  const typeMap = {
    '互联网': 'primary',
    '金融': 'success',
    '制造业': 'warning',
    '医疗': 'danger',
    '教育': 'info'
  }
  return typeMap[industry] || ''
}

const getResultTagType = (result) => {
  const typeMap = {
    'offer': 'success',
    '进行中': 'primary',
    '已拒绝': 'warning',
    '简历挂': 'danger',
    '测评挂': 'danger',
    '笔试挂': 'danger',
    '一面挂': 'danger',
    '二面挂': 'danger',
    '三面挂': 'danger',
    'HR面挂': 'danger',
    '未参加': 'info'
  }
  return typeMap[result] || 'info'
}

const handleAction = (command) => {
  switch (command) {
    case 'add-record':
      showAddDialog.value = true
      isEditing.value = false
      currentRecord.value = null
      break
    case 'edit-progress':
      editProgress()
      break
    case 'export-data':
      exportData()
      break
    case 'delete-progress':
      deleteProgress()
      break
  }
}

const editProgress = () => {
  if (!progress.value) return

  editProgressForm.value = {
    name: progress.value.name,
    description: progress.value.description || '',
    tags: progress.value.tags || []
  }
  showEditProgressDialog.value = true
}

const saveProgressEdit = async () => {
  try {
    await editProgressFormRef.value.validate()

    store.updateProgress(progressId, editProgressForm.value)
    ElMessage.success('进度更新成功')
    showEditProgressDialog.value = false
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const exportData = () => {
  if (!progress.value) return

  const data = {
    progress: progress.value,
    records: records.value
  }

  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${progress.value.name}_招聘数据_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('数据导出成功')
}

const deleteProgress = () => {
  if (!progress.value) return

  ElMessageBox.confirm(
      `确定要删除进度 "${progress.value.name}" 吗？该操作不可恢复，且会删除所有相关记录。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
  ).then(() => {
    store.deleteProgress(progressId)
    ElMessage.success('进度删除成功')
    router.push('/')
  }).catch(() => {
    // 用户取消
  })
}

const editRecord = (record) => {
  isEditing.value = true
  currentRecord.value = { ...record }
  showAddDialog.value = true
}

const deleteRecord = (recordId) => {
  ElMessageBox.confirm(
      '确定要删除这条记录吗？',
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
  ).then(() => {
    store.deleteRecord(progressId, recordId)
    ElMessage.success('记录删除成功')
  }).catch(() => {
    // 用户取消
  })
}

const handleRecordSubmit = (recordData) => {
  if (isEditing.value && currentRecord.value) {
    // 更新记录
    store.updateRecord(progressId, currentRecord.value.id, recordData)
    ElMessage.success('记录更新成功')
  } else {
    // 添加新记录
    store.addRecord(progressId, recordData)
    ElMessage.success('记录添加成功')
  }

  showAddDialog.value = false
  isEditing.value = false
  currentRecord.value = null
}
</script>

<style scoped>
.progress-detail {
  padding: 0;
  height: 100%;
  overflow-y: auto;
}

.detail-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.back-button {
  flex-shrink: 0;
}

.back-button :deep(.el-button) {
  color: white;
}

.back-button :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.1);
}

.header-main {
  flex: 1;
}

.progress-title {
  margin: 0 0 12px 0;
  font-size: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  opacity: 0.9;
}

.tags-section {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.tag-item {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
}

.header-actions {
  flex-shrink: 0;
}

.stats-section {
  padding: 24px;
  background: white;
  margin: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-statistic) {
  text-align: center;
}

:deep(.el-statistic__head) {
  color: #718096;
  font-size: 14px;
  margin-bottom: 8px;
}

:deep(.el-statistic__number) {
  font-size: 32px;
  font-weight: bold;
}

:deep(.el-statistic__prefix) {
  margin-right: 4px;
}

.records-section {
  padding: 0 16px 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 8px;
}

.section-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 20px;
}

.section-actions {
  display: flex;
  gap: 12px;
}

.stages {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.stage-tag {
  margin: 2px;
}

.no-stages {
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>