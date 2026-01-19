<template>
  <div class="create-progress">
    <div class="page-header">
      <el-button type="text" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>新建进度</h1>
    </div>

    <div class="create-content">
      <el-card class="create-card" shadow="never">
        <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
            label-position="top"
            size="large"
        >
          <el-form-item label="进度名称" prop="name">
            <el-input
                v-model="form.name"
                :prefix-icon="Collection"
            />
          </el-form-item>

          <el-form-item label="进度描述">
            <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                resize="none"
            />
          </el-form-item>

          <el-form-item label="预设标签">
            <div class="tag-suggestions">
              <el-tag
                  v-for="tag in suggestedTags"
                  :key="tag"
                  class="suggestion-tag"
                  type="info"
                  @click="addTag(tag)"
              >
                {{ tag }}
              </el-tag>
            </div>
            <el-select
                v-model="form.tags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="选择或输入标签"
                style="width: 100%; margin-top: 8px;"
            >
              <el-option
                  v-for="tag in allTags"
                  :key="tag"
                  :label="tag"
                  :value="tag"
              />
            </el-select>
          </el-form-item>

<!--          <el-form-item label="目标设置">-->
<!--            <el-row :gutter="20">-->
<!--              <el-col :span="12">-->
<!--                <div class="target-item">-->
<!--                  <label>目标记录数</label>-->
<!--                  <el-input-number-->
<!--                      v-model="form.targetCount"-->
<!--                      :min="0"-->
<!--                      :max="1000"-->
<!--                      placeholder="例如：50"-->
<!--                      style="width: 100%;"-->
<!--                  />-->
<!--                </div>-->
<!--              </el-col>-->
<!--              <el-col :span="12">-->
<!--                <div class="target-item">-->
<!--                  <label>期望 Offer 数</label>-->
<!--                  <el-input-number-->
<!--                      v-model="form.targetOffers"-->
<!--                      :min="0"-->
<!--                      :max="100"-->
<!--                      placeholder="例如：3"-->
<!--                      style="width: 100%;"-->
<!--                  />-->
<!--                </div>-->
<!--              </el-col>-->
<!--            </el-row>-->
<!--          </el-form-item>-->

<!--          <el-form-item>-->
            <div class="form-actions">
<!--              <el-button @click="goBack" size="large">取消</el-button>-->
              <el-button
                  type="primary"
                  @click="handleSubmit"
                  size="large"
                  :loading="loading"
              >
                创建进度
              </el-button>
            </div>
<!--          </el-form-item>-->
        </el-form>
      </el-card>

      <!-- 创建成功提示 -->
      <el-dialog
          v-model="successDialogVisible"
          title="创建成功"
          width="400px"
          center
      >
        <div class="success-content">
          <el-icon size="48" color="#67C23A"><CircleCheck /></el-icon>
          <h3>进度创建成功！</h3>
          <p>新的招聘进度 <strong>{{ createdProgress?.name }}</strong> 已创建</p>
        </div>

        <template #footer>
          <div class="success-actions">
            <el-button @click="viewProgress">查看进度</el-button>
            <el-button type="primary" @click="createAnother">继续创建</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useRecruitmentStore } from '../store'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Collection,
  CircleCheck
} from '@element-plus/icons-vue'

const router = useRouter()
const store = useRecruitmentStore()
const formRef = ref()
const loading = ref(false)

// 表单数据
const form = reactive({
  name: '',
  description: '',
  tags: [],
  targetCount: 0,
  targetOffers: 0
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入进度名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 建议的标签
const suggestedTags = [
  '秋招', '春招', '暑期实习', '日常实习', '社招',
  '互联网专场', '金融专场', '国企专场', '海外招聘'
]

// 所有标签选项
const allTags = [...suggestedTags, '紧急', '重点', '已完结']

// 创建成功的相关状态
const successDialogVisible = ref(false)
const createdProgress = ref(null)

// 返回上一页
const goBack = () => {
  router.push('/')
}

// 添加标签
const addTag = (tag) => {
  if (!form.tags.includes(tag)) {
    form.tags.push(tag)
  }
}

// 处理表单提交
const handleSubmit = async () => {
  try {
    // 验证表单
    await formRef.value.validate()

    loading.value = true

    // 创建进度
    const progress = store.createProgress(form.name, form.description)

    // 添加额外信息到进度
    store.updateProgress(progress.id, {
      tags: form.tags,
      targetCount: form.targetCount,
      targetOffers: form.targetOffers
    })

    // 保存成功的数据
    createdProgress.value = progress

    // 显示成功对话框
    successDialogVisible.value = true

  } catch (error) {
    console.error('创建失败:', error)
    if (error.errors) {
      ElMessage.warning('请填写完整信息')
    }
  } finally {
    loading.value = false
  }
}

// 查看创建的进度
const viewProgress = () => {
  if (createdProgress.value) {
    router.push(`/progress/${createdProgress.value.id}`)
  }
}

// 继续创建另一个进度
const createAnother = () => {
  // 重置表单
  form.name = ''
  form.description = ''
  form.tags = []
  form.targetCount = 0
  form.targetOffers = 0

  successDialogVisible.value = false
  createdProgress.value = null

  // 滚动到顶部
  window.scrollTo(0, 0)
}
</script>

<style scoped>
.create-progress {
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

.create-content {
  max-width: 800px;
  margin: 0 auto;
}

.create-card {
  padding: 40px;
  border-radius: 12px;
  background: white;
}

.form-tip {
  color: #718096;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.target-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.target-item label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-content h3 {
  margin: 16px 0 8px;
  color: #2d3748;
}

.success-content p {
  color: #718096;
  line-height: 1.6;
}

.success-content strong {
  color: #409EFF;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .create-progress {
    padding: 16px;
  }

  .create-card {
    padding: 24px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .page-header h1 {
    font-size: 24px;
  }
}
</style>