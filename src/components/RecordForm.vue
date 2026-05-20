<template>
  <div class="record-form">
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="top"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="公司名称" prop="companyName">
            <el-input v-model="form.companyName" placeholder="输入公司名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="行业" prop="industry">
            <el-select v-model="form.industry" placeholder="选择行业" style="width: 100%;">
              <el-option
                  v-for="item in industryOptions"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="岗位" prop="position">
            <el-input v-model="form.position" placeholder="输入岗位名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="城市" prop="city">
            <el-input v-model="form.city" placeholder="输入城市" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item prop="applyDate">
            <template #label>
              <span v-if="form.result !== '待投递'" style="color: red;">*</span>
              投递日期
            </template>
            <el-date-picker
                v-model="form.applyDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%;"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="result">
            <el-select v-model="form.result" placeholder="选择状态" style="width: 100%;">
              <el-option
                  v-for="item in resultOptions"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="流程">
        <div class="stages-section">
          <div v-if="form.currentStage.length > 0" class="stage-table-header">
            <span>阶段</span>
            <span>日期</span>
            <span>备注</span>
            <span>面试经验</span>
            <span>操作</span>
          </div>
          <div v-for="(stage, index) in form.currentStage" :key="index" class="stage-item">
            <!-- 阶段名称 - 添加验证 -->
            <el-form-item
                :prop="`currentStage.${index}.name`"
                :rules="stageNameRules"
                class="stage-field"
            >
              <el-input
                  v-model="stage.name"
                  placeholder="阶段名称"
              />
            </el-form-item>

            <!-- 日期 - 添加验证 -->
            <el-form-item
                :prop="`currentStage.${index}.date`"
                :rules="stageDateRules"
                class="stage-field"
            >
              <el-date-picker
                  v-model="stage.date"
                  type="date"
                  placeholder="日期"
                  value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <div class="stage-field">
              <el-input
                  v-model="stage.notes"
                  placeholder="备注"
              />
            </div>
            <div class="stage-field">
              <el-button
                  :type="getExperienceCount(stage) > 0 ? 'success' : 'primary'"
                  plain
                  :disabled="!stage.name || !stage.date"
                  @click="openExperienceDialog(stage)"
              >
                {{ getExperienceCount(stage) > 0 ? '查看' : '添加' }}
              </el-button>
            </div>
            <div class="stage-field stage-actions-cell">
              <el-button
                  type="danger"
                  text
                  @click="removeStage(index)"
              >
                删除
              </el-button>
            </div>
          </div>
          <el-button type="text" @click="addStage">
            <el-icon><Plus /></el-icon> 添加阶段
          </el-button>
        </div>
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="待遇">
            <el-input v-model="form.salary" placeholder="输入待遇" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="官网">
            <el-input v-model="form.website" placeholder="输入官网或投递页面网址，而后通过点击公司名跳转" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注">
        <el-input
            v-model="form.note"
            type="textarea"
            :rows="3"
            placeholder="输入总结、注意事项等"
        />
      </el-form-item>
    </el-form>

    <el-dialog
        v-model="experienceDialogVisible"
        :title="experienceDialogTitle"
        width="760px"
        append-to-body
    >
      <div class="experience-editor">
        <el-input
            v-model="experienceContent"
            type="textarea"
            :rows="8"
            maxlength="20000"
            show-word-limit
            placeholder="记录面试题、回答思路、复盘总结、注意事项等"
        />
        <div class="experience-actions">
          <el-button type="danger" text @click="removeExperience">
            删除经验
          </el-button>
          <el-button @click="experienceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveExperience">保存经验</el-button>
        </div>
      </div>
    </el-dialog>

    <div class="form-actions">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRecruitmentStore } from '../store'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  record: {
    type: Object,
    default: null
  },
  progressId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit', 'cancel'])

const store = useRecruitmentStore()
const formRef = ref()
const experienceDialogVisible = ref(false)
const selectedStage = ref(null)
const experienceContent = ref('')

const industryOptions = store.industryOptions
const resultOptions = store.resultOptions

const experienceDialogTitle = computed(() => {
  const stageName = selectedStage.value?.name || '阶段'
  return `${stageName} - 面试经验`
})

// 表单数据
const form = reactive({
  companyName: '',
  industry: '',
  city: '',
  position: '',
  applyDate: '',
  currentStage: [],
  result: '进行中',
  salary: '',
  note: '',
  website: ''
})

// 初始空表单数据
const initialForm = {
  companyName: '',
  industry: '',
  city: '',
  position: '',
  applyDate: '',
  currentStage: [],
  result: '进行中',
  salary: '',
  note: '',
  website: ''
}

// 表单验证规则
const rules = {
  companyName: [
    { required: true, message: '请输入公司名称', trigger: 'blur' }
  ],
  industry: [
    { required: true, message: '请选择行业', trigger: 'change' }
  ],
  position: [
    { required: true, message: '请输入岗位', trigger: 'blur' }
  ],
  applyDate: [
    {
      validator: (rule, value, callback) => {
        // 如果状态是"待投递"，则不验证
        if (form.result === '待投递') {
          callback()
          return
        }

        // 如果状态不是"待投递"，则验证必填
        if (!value) {
          callback(new Error('请填写投递日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  currentStage: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback()
          return
        }

        const hasError = value.some((stage, index) => {
          return !stage.name || !stage.date
        })

        if (hasError) {
          callback(new Error('请填写所有阶段的名称和日期'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 阶段名称的验证规则
const stageNameRules = [
  { required: true, message: '请输入阶段名称', trigger: 'blur' },
  { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
]

// 阶段日期的验证规则
const stageDateRules = [
  { required: true, message: '请选择日期', trigger: 'change' },
  {
    validator: (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }

      const selectedDate = new Date(value)
      // const today = new Date()
      // today.setHours(24, 0, 0, 0)


      if (selectedDate < new Date(form.applyDate)) {
        callback(new Error('日期不能早于投递日期'))
      } else {
        callback()
      }
    },
    trigger: 'change'
  }
]


// 生命周期
onMounted(() => {
  resetForm()
  // if (props.record) {
  //   Object.assign(form, props.record)
  // }
})

// 方法
const addStage = () => {
  form.currentStage.push({
    id: store.generateId(),
    name: '',
    date: '',
    notes: '',
    experienceIds: []
  })
}

const removeStage = (index) => {
  form.currentStage.splice(index, 1)
}

const openExperienceDialog = (stage) => {
  if (!stage.name || !stage.date) {
    ElMessage.warning('请先填写阶段名称和日期')
    return
  }

  ensureStageId(stage)
  selectedStage.value = stage
  experienceContent.value = stage.interviewExperienceContent || ''
  experienceDialogVisible.value = true
}

const saveExperience = () => {
  if (!selectedStage.value) {
    return
  }

  ensureStageId(selectedStage.value)
  selectedStage.value.interviewExperienceContent = experienceContent.value.trim()
  experienceDialogVisible.value = false
  ElMessage.success('面试经验已保存，提交记录后生效')
}

const removeExperience = () => {
  if (!selectedStage.value) {
    return
  }

  selectedStage.value.interviewExperienceContent = ''
  experienceContent.value = ''
  ElMessage.success('面试经验已删除，提交记录后生效')
}

const getExperienceCount = (stage) => {
  if (stage.interviewExperienceContent?.trim()) {
    return 1
  }

  if (!props.record || !stage.id) {
    return 0
  }

  return store.getStageInterviewExperience(props.record.id, stage.id) ? 1 : 0
}

const ensureStageId = (stage) => {
  if (!stage.id) {
    stage.id = store.generateId()
  }

  if (!Array.isArray(stage.experienceIds)) {
    stage.experienceIds = []
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    if (form.result === '待投递' && form.currentStage.length > 0) {
      ElMessage.error('待投递状态不能存在流程')
      return;
    }

    // 过滤掉空值的阶段
    const validStages = form.currentStage
        .filter(stage => stage.name && stage.date)
        .map(stage => {
          ensureStageId(stage)
          const { interviewExperienceContent, ...stageData } = stage
          return {
            ...stageData,
            interviewExperienceContent
          }
        })

    const submitData = {
      ...form,
      currentStage: validStages
    }

    emit('submit', submitData)
  } catch (error) {
    console.error('表单验证失败:', error)
    if (error.errors) {
      ElMessage.warning('请填写完整信息')
    }
  }
}

const handleCancel = () => {
  resetForm()
  emit('cancel')
}

// 重置表单
const resetForm = () => {
  // 先重置表单验证状态
  if (formRef.value) {
    formRef.value.resetFields()
  }

  // 清空表单数据
  Object.assign(form, { ...initialForm })

  // 如果有传入的记录，则使用传入的记录
  if (props.record) {
    Object.assign(form, JSON.parse(JSON.stringify(props.record)))

    // 确保 currentStage 是一个数组
    if (!form.currentStage) {
      form.currentStage = []
    }

    form.currentStage.forEach(ensureStageId)
    form.currentStage.forEach(stage => {
      const experience = store.getStageInterviewExperience(props.record.id, stage.id)
      stage.interviewExperienceContent = experience?.content || ''
    })
  }
}
</script>

<style scoped>
.record-form {
  padding: 20px 0;
}

.stages-section {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
}

.stage-table-header {
  display: grid;
  grid-template-columns: 1.2fr 1.1fr 1.4fr 0.8fr 0.6fr;
  gap: 12px;
  padding: 0 0 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  color: #606266;
  font-size: 13px;
  font-weight: 600;
}

.stage-table-header span:nth-child(4),
.stage-table-header span:nth-child(5) {
  text-align: center;
}

.stage-item {
  display: grid;
  grid-template-columns: 1.2fr 1.1fr 1.4fr 0.8fr 0.6fr;
  align-items: start;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e4e7ed;
}

.stage-field {
  margin-bottom: 0;
}

.stage-field :deep(.el-form-item__content) {
  width: 100%;
}

.stage-field :deep(.el-input),
.stage-field :deep(.el-date-editor.el-input),
.stage-field :deep(.el-button) {
  width: 100%;
}

.stage-actions-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 32px;
}

.stage-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.experience-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.experience-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}
</style>
