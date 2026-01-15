<template>
  <div>
    <el-table
        :data="form.currentStage"
        style="width: 100%"
        :header-cell-style="{ backgroundColor: '#f5f7fa', fontWeight: '600' }"
        class="percentage-columns-table"
    >
      <el-table-column
          prop="name"
          label="阶段名称"
      >
        <template #default="scope">
          <div class="cell-content">
            <el-text v-model="scope.row.name">{{ scope.row.name }}</el-text>
          </div>
        </template>
      </el-table-column>

      <el-table-column
          prop="date"
          label="日期"
      >
        <template #default="scope">
          <div class="cell-content">
            <el-text
                v-model="scope.row.date"
                type="date"
                value-format="YYYY-MM-DD"
            >
              {{ scope.row.date }}
            </el-text>
          </div>
        </template>
      </el-table-column>

      <el-table-column
          prop="notes"
          label="备注"
      >
        <template #default="scope">
          <div class="cell-content">
            <el-text
                v-if="scope.row.notes && scope.row.notes.length > 0"
                v-model="scope.row.notes"
            >
              {{ scope.row.notes }}
            </el-text>
            <span v-else class="empty-cell">-</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <div class="form-actions">
    <el-button type="primary" @click="handleSubmit">确定</el-button>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
const emit = defineEmits(['submit'])

const props = defineProps({
  stage: {
    type: Object,
    default: null
  }
})

// 表单数据
const form = reactive({
  currentStage: [],
})

onMounted(() => {
  if (props.stage) {
    Object.assign(form.currentStage, props.stage)
    console.log(form)
  }
})

const handleSubmit = async () => {
  emit('submit')
}
</script>

<style scoped>
.stages-container {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
}

.empty-cell {
  color: #c0c4cc;
  font-style: italic;
}

.cell-content {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 确保表格行高度一致 */
:deep(.el-table__row) {
  height: 60px;
}

:deep(.el-table__cell) {
  padding: 8px 12px !important;
}

:deep(.el-text) {
  width: 100%;
}

/* 使用 CSS 设置列宽比例 */
:deep(.percentage-columns-table) {
  table-layout: fixed;
}

:deep(.percentage-columns-table .el-table__header col:nth-child(1)),
:deep(.percentage-columns-table .el-table__body col:nth-child(1)) {
  width: 30%;
}

:deep(.percentage-columns-table .el-table__header col:nth-child(2)),
:deep(.percentage-columns-table .el-table__body col:nth-child(2)) {
  width: 30%;
}

:deep(.percentage-columns-table .el-table__header col:nth-child(3)),
:deep(.percentage-columns-table .el-table__body col:nth-child(3)) {
  width: 40%;
}
</style>