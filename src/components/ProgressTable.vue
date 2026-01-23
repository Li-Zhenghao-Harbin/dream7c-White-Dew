<template>
  <div class="progress-table">
    <!-- 表格主体 -->
    <el-table
        :data="records"
        style="width: 100%"
        stripe
        border
        size="large"
        @row-click="handleRowClick"
    >
      <el-table-column prop="companyName" label="公司名称" width="180" fixed />
      <el-table-column prop="industry" label="行业" width="120">
        <template #default="scope">
          <el-tag>{{ scope.row.industry }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="result" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getResultType(scope.row.result)">
            {{ scope.row.result }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 更多列... -->
    </el-table>
  </div>
</template>

<script setup>
// 实现表格逻辑
</script>