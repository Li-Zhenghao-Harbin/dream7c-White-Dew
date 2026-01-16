<template>
  <div class="home">
<!--    <div class="home-header">-->
<!--      <h1>柒幻 白露</h1>-->
<!--    </div>-->

    <div class="home-content">
      <div class="quick-actions">
        <el-card class="action-card" shadow="hover" @click="goToCreateProgress">
          <div class="action-content">
            <el-icon size="48" color="#409EFF"><Plus /></el-icon>
            <h3>新建进度</h3>
          </div>
        </el-card>

        <el-card class="action-card" shadow="hover" @click="openDataManager">
          <div class="action-content">
            <el-icon size="48" color="#E6A23C"><Download /></el-icon>
            <h3>数据管理</h3>
          </div>
        </el-card>
<!--        <el-card class="action-card" shadow="hover" @click="refreshData">-->
<!--          <div class="action-content">-->
<!--            <el-icon size="48" color="#67C23A"><Refresh /></el-icon>-->
<!--            <h3>刷新</h3>-->
<!--          </div>-->
<!--        </el-card>-->

<!--        <el-card class="action-card" shadow="hover" @click="exportData">-->
<!--          <div class="action-content">-->
<!--            <el-icon size="48" color="#E6A23C"><Download /></el-icon>-->
<!--            <h3>导出</h3>-->
<!--          </div>-->
<!--        </el-card>-->
      </div>

      <!-- 进度列表 -->
      <div class="progress-section">
        <div class="section-header">
          <h2>所有进度</h2>
          <el-button
              type="text"
              @click="refreshData"
              :loading="store.isLoading"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>

        <div v-if="store.isLoading" class="loading-state">
          <el-icon class="loading-icon" size="48"><Loading /></el-icon>
          <p>加载中...</p>
        </div>

        <div v-else-if="store.getAllProgresses.length === 0" class="empty-state">
          <el-empty description="暂无进度">
            <el-button type="primary" @click="goToCreateProgress">
              创建第一个进度
            </el-button>
          </el-empty>
        </div>

        <div v-else class="progress-grid">
          <el-card
              v-for="progress in store.getAllProgresses"
              :key="progress.id"
              class="progress-card"
              shadow="hover"
              @click="viewProgress(progress.id)"
          >
            <template #header>
              <div class="card-header">
                <div class="progress-title">
                  <el-icon><Folder /></el-icon>
                  <span>{{ progress.name }}</span>
                </div>
                <el-dropdown @click.stop>
                  <el-button type="text" size="small">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="editProgress(progress)">
                        编辑
                      </el-dropdown-item>
                      <el-dropdown-item
                          @click="deleteProgress(progress.id)"
                          style="color: #F56C6C;"
                      >
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>

            <div class="card-content">
              <p class="description">{{ progress.description || '暂无描述' }}</p>

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

<!--              <div class="progress-stats">-->
              <div style="clear: both;"><br/>
                <div class="stat-item">
                  <el-icon><Document /></el-icon>
                  <span>{{ progress.records ? progress.records.length : 0 }} 条记录</span>
                </div>
                <div class="stat-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ progress.created }}</span>
                </div>
              </div>

<!--              <div v-if="progress.records && progress.records.length > 0" class="recent-records">-->
<!--                <p class="recent-title">最近记录:</p>-->
<!--                <div-->
<!--                    v-for="record in progress.records.slice(0, 3)"-->
<!--                    :key="record.id"-->
<!--                    class="record-item"-->
<!--                >-->
<!--                  <span class="company">{{ record.companyName }}</span>-->
<!--                  <el-tag :type="getResultTagType(record.result)" size="small">-->
<!--                    {{ record.result }}-->
<!--                  </el-tag>-->
<!--                </div>-->
<!--              </div>-->
            </div>

            <template #footer>
              <el-button type="primary" text @click.stop="viewProgress(progress.id)">
                查看详情
              </el-button>
            </template>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 编辑进度对话框 -->
    <el-dialog
        v-model="editDialogVisible"
        title="编辑进度"
        width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="进度名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
              v-model="editForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入进度描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditProgress">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRecruitmentStore } from '../store'
import {
  Plus,
  Refresh,
  Download,
  Loading,
  Folder,
  MoreFilled,
  Document,
  Calendar
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const store = useRecruitmentStore()

const editDialogVisible = ref(false)
const editForm = ref({
  id: '',
  name: '',
  description: ''
})

// 导航到创建进度页面
const goToCreateProgress = () => {
  router.push('/create-progress')
}

// 查看进度详情
const viewProgress = (progressId) => {
  router.push(`/progress/${progressId}`)
}

// 刷新数据
const refreshData = () => {
  store.loadFromStorage()
  ElMessage.success('数据已刷新')
}

// 导出数据
// const exportData = () => {
//   const data = store.getAllProgresses
//
//   const jsonStr = JSON.stringify(data, null, 2)
//   const blob = new Blob([jsonStr], { type: 'application/json' })
//   const url = URL.createObjectURL(blob)
//   const a = document.createElement('a')
//   a.href = url
//   a.download = `导出数据_${new Date().toISOString().split('T')[0]}.json`
//   document.body.appendChild(a)
//   a.click()
//   document.body.removeChild(a)
//   URL.revokeObjectURL(url)
//   ElMessage.success('数据导出成功')
// }

// 编辑进度
const editProgress = (progress) => {
  editForm.value = {
    id: progress.id,
    name: progress.name,
    description: progress.description || ''
  }
  editDialogVisible.value = true
}

// 保存编辑
const saveEditProgress = () => {
  if (!editForm.value.name.trim()) {
    ElMessage.warning('请输入进度名称')
    return
  }

  store.updateProgress(editForm.value.id, {
    name: editForm.value.name,
    description: editForm.value.description
  })

  editDialogVisible.value = false
  ElMessage.success('进度更新成功')
}

// 删除进度
const deleteProgress = (progressId) => {
  ElMessageBox.confirm(
      '确定要删除这个进度吗？该操作不可恢复，且会删除所有相关记录。',
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
  }).catch(() => {
    // 用户取消删除
  })
}

// 获取结果标签类型
const getResultTagType = (result) => {
  const typeMap = {
    '进行中': 'primary',
    'offer': 'success',
    '已拒绝': 'warning',
    '简历挂': 'danger',
    '测评挂': 'danger',
    '笔试挂': 'danger',
    '面试挂': 'danger',
    '未参加': 'info'
  }
  return typeMap[result] || 'info'
}
</script>

<style scoped>
.home {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.home-header {
  margin-bottom: 32px;
  text-align: center;
}

.home-header h1 {
  font-size: 32px;
  color: #2d3748;
  margin-bottom: 8px;
}

.home-header .subtitle {
  color: #718096;
  font-size: 16px;
}

.home-content {
  max-width: 1200px;
  margin: 0 auto;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1) !important;
}

.action-content {
  text-align: center;
  padding: 20px;
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

.progress-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  color: #2d3748;
  font-size: 20px;
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
}

.loading-icon {
  animation: rotate 2s linear infinite;
  color: #409EFF;
  margin-bottom: 16px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  padding: 40px 0;
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.progress-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.progress-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.progress-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2d3748;
}

.card-content {
  padding: 0 20px;
}

.description {
  color: #718096;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
  min-height: 42px;
}

.progress-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #718096;
  font-size: 14px;
}

.recent-records {
  padding-top: 16px;
}

.recent-title {
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f7fafc;
}

.record-item:last-child {
  border-bottom: none;
}

.company {
  color: #2d3748;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}
</style>