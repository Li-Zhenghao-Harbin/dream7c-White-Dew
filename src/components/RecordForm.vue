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
          <el-form-item label="城市" prop="city">
            <el-input v-model="form.city" placeholder="输入城市" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="岗位" prop="position">
            <el-input v-model="form.position" placeholder="输入岗位名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="投递日期" prop="applyDate">
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
          <el-form-item label="结果" prop="result">
            <el-select v-model="form.result" placeholder="选择结果" style="width: 100%;">
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
          <div v-for="(stage, index) in form.currentStage" :key="index" class="stage-item">
            <el-input
                v-model="stage.name"
                placeholder="阶段名称"
                style="width: 150px; margin-right: 10px;"
            />
            <el-date-picker
                v-model="stage.date"
                type="date"
                placeholder="日期"
                style="width: 150px; margin-right: 10px;"
                value-format="YYYY-MM-DD"
            />
            <el-input
                v-model="stage.notes"
                placeholder="备注"
                style="width: 200px; margin-right: 10px;"
            />
            <el-button
                type="danger"
                text
                @click="removeStage(index)"
            >
              删除
            </el-button>
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

    <div class="form-actions">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRecruitmentStore } from '../store'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  record: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const store = useRecruitmentStore()
const formRef = ref()

const industryOptions = store.industryOptions
const resultOptions = store.resultOptions

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
    { required: true, message: '请选择投递日期', trigger: 'change' }
  ]
}

// 生命周期
onMounted(() => {
  if (props.record) {
    Object.assign(form, props.record)
  }
})

// 方法
const addStage = () => {
  form.currentStage.push({
    name: '',
    date: '',
    notes: ''
  })
}

const removeStage = (index) => {
  form.currentStage.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    // 过滤掉空值的阶段
    const validStages = form.currentStage.filter(stage =>
        stage.name && stage.date
    )

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

.stage-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e4e7ed;
}

.stage-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
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