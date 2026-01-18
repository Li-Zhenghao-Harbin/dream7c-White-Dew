<template>
  <div class="data-manager">
    <el-button type="info" plain @click="showManager = true">
      <el-icon><InfoFilled /></el-icon>
      关于
    </el-button>

    <el-dialog
        v-model="showManager"
        title="关于 柒幻 白露"
        width="400px"
    >
      <el-card class="about">
        <div class="about-container">
          <div class="text-section">
            <el-text class="title"><b>柒幻 白露</b></el-text><br/>
            <el-text class="version">beta</el-text>
          </div>
          <div class="icon-section">
            <img src="../../icon.ico" class="app-icon"/>
          </div>
        </div>
      </el-card>
      <br/>
      <el-text class="description">
        总设计师 | 李正浩<br/>
        版权所有 &copy; 2026 柒幻工作室<br/>
        www.dream7c.com
      </el-text>
      <template #footer>
        <el-button type="primary" @click="showManager = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const showManager = ref(false)
</script>

<style scoped>
.about-container {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: space-between;
  width: 100%;
}

.text-section {
  flex: 0 0 60%; /* 占60%宽度 */
  max-width: 60%;
  padding-right: 20px; /* 添加一些间距 */
}

.icon-section {
  flex: 0 0 40%; /* 占40%宽度 */
  max-width: 40%;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.app-icon {
  width: 80px; /* 调整图标大小 */
  height: 80px;
  object-fit: contain; /* 保持比例 */
}

.title {
  font-size: 24px;
  color: #333;
}

.version {
  font-size: 14px;
  color: #666;
  margin-right: 10px;
}

.description {
  font-size: 14px;
  color: #777;
  line-height: 1.6;
  margin-top: 10px;
}

.storage-status h3,
.data-actions h3,
.storage-info h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.storage-info p {
  margin: 8px 0;
}
</style>