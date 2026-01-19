<template>
  <div id="app">
    <el-container class="app-container">
      <!-- 侧边栏导航 -->
<!--      <el-aside width="200px" class="sidebar">-->
<!--        <div class="logo">-->
<!--          <el-icon size="24" color="#409EFF"><Collection /></el-icon>-->
<!--          <span>White Dew</span>-->
<!--        </div>-->

<!--        <el-menu-->
<!--            :default-active="activeMenu"-->
<!--            class="sidebar-menu"-->
<!--            @select="handleMenuSelect"-->
<!--        >-->
<!--          <el-menu-item index="/">-->
<!--            <el-icon><House /></el-icon>-->
<!--            <span>首页</span>-->
<!--          </el-menu-item>-->

<!--          <el-menu-item index="/create-progress">-->
<!--            <el-icon><Plus /></el-icon>-->
<!--            <span>新建进度</span>-->
<!--          </el-menu-item>-->

<!--          <el-divider />-->

<!--          <div class="progress-list-title">-->
<!--            <span>招聘进度</span>-->
<!--            <el-icon @click="refreshData"><Refresh /></el-icon>-->
<!--          </div>-->

<!--          <el-menu-item-->
<!--              v-for="progress in store.getAllProgresses"-->
<!--              :key="progress.id"-->
<!--              :index="'/progress/' + progress.id"-->
<!--          >-->
<!--            <el-icon><Folder /></el-icon>-->
<!--            <span>{{ progress.name }}</span>-->
<!--            <el-tag size="small" type="info">-->
<!--              {{ progress.records ? progress.records.length : 0 }}-->
<!--            </el-tag>-->
<!--          </el-menu-item>-->
<!--        </el-menu>-->

<!--        <div class="sidebar-footer">-->
<!--          <el-button-->
<!--              type="text"-->
<!--              size="small"-->
<!--              @click="showAbout"-->
<!--              class="about-btn"-->
<!--          >-->
<!--            <el-icon><InfoFilled /></el-icon>-->
<!--            关于-->
<!--          </el-button>-->
<!--        </div>-->
<!--      </el-aside>-->

      <!-- 主内容区 -->
      <el-config-provider :locale="locale">
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-config-provider>

<!--      store-->
      <div class="data-manager-container">
        <About />
      </div>
    </el-container>

    <!-- 关于对话框 -->
<!--    <el-dialog-->
<!--        v-model="aboutDialogVisible"-->
<!--        title="关于 White Dew"-->
<!--        width="400px"-->
<!--        center-->
<!--    >-->
<!--      <div class="about-content">-->
<!--        <h3>White Dew - 招聘信息管理</h3>-->
<!--        <p>版本: 1.0.0</p>-->
<!--        <p>一个用于管理招聘进度的桌面应用</p>-->
<!--        <p>技术栈: Electron + Vue3 + Element Plus</p>-->
<!--        <p class="copyright">© 2024 招聘信息管理系统</p>-->
<!--      </div>-->

<!--      <template #footer>-->
<!--        <el-button type="primary" @click="aboutDialogVisible = false">-->
<!--          确定-->
<!--        </el-button>-->
<!--      </template>-->
<!--    </el-dialog>-->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRecruitmentStore } from './store'
import DataManager from './components/DataManager.vue'
import { ElMessage, ElConfigProvider } from 'element-plus'
import {
  Collection,
  House,
  Plus,
  Refresh,
  Folder,
  InfoFilled
} from '@element-plus/icons-vue'
import About from "@/components/About.vue";
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const locale = zhCn

const router = useRouter()
const route = useRoute()
const store = useRecruitmentStore()

// 页面加载时加载数据
onMounted(async () => {
  console.log('🚀 应用启动')
  console.log('🌐 检查环境:')
  console.log('- Electron API:', !!window.electronAPI)
  console.log('- LocalStorage:', !!window.localStorage)

  try {
    await store.loadFromStorage()
    console.log('✅ 数据加载完成')

    // 显示欢迎消息
    const info = store.getStorageInfo()
    if (info.hasData) {
      ElMessage.success(`已加载 ${info.progressCount} 个进度`)
    }
  } catch (error) {
    console.error('❌ 数据加载失败:', error)
    ElMessage.error('数据加载失败，但您可以继续使用')
  }
})

// 自动保存机制
let saveInterval = null
onMounted(() => {
  // 每30秒自动保存一次
  saveInterval = setInterval(async () => {
    console.log('⏰ 自动保存数据...')
    try {
      await store.saveToStorage()
      console.log('✅ 自动保存成功')
    } catch (error) {
      console.error('❌ 自动保存失败:', error)
    }
  }, 30000) // 30秒
})

onUnmounted(() => {
  if (saveInterval) {
    clearInterval(saveInterval)
    console.log('🛑 自动保存已停止')
  }
})

// 监听页面可见性变化（切换标签页、最小化等）
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    console.log('📝 页面隐藏，保存数据...')
    try {
      await store.saveToStorage()
      console.log('✅ 隐藏时保存成功')
    } catch (error) {
      console.error('❌ 隐藏时保存失败:', error)
    }
  }
})

// 监听窗口关闭事件
window.addEventListener('beforeunload', async (event) => {
  console.log('🔚 应用即将关闭，保存数据...')

  try {
    // 尝试保存数据
    const success = await store.saveToStorage()

    if (success) {
      console.log('✅ 关闭前保存成功')
    } else {
      console.warn('⚠️  关闭前保存可能失败')
      // 不阻止关闭，数据已在 localStorage 中
    }
  } catch (error) {
    console.error('❌ 关闭前保存出错:', error)
  }

  // 允许窗口正常关闭
  // 注意：不要调用 event.preventDefault()，否则会阻止关闭
})

// 添加调试命令到全局
window.debugStore = () => {
  console.log('🔍 调试存储状态:')
  console.log('- 进度数量:', store.getAllProgresses.length)
  console.log('- 加载中:', store.isLoading)
  console.log('- 最后保存:', store.lastSaveTime)

  const stats = store.getStorageInfo()
  console.log('- 存储统计:', stats)

  // 手动保存测试
  store.saveToStorage().then(success => {
    console.log('- 手动保存结果:', success ? '成功' : '失败')
  })
}

const aboutDialogVisible = ref(false)

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  return route.path
})

// 处理菜单选择
const handleMenuSelect = (index) => {
  router.push(index)
}

// 刷新数据
const refreshData = () => {
  store.loadFromStorage()
}

// 显示关于对话框
const showAbout = () => {
  aboutDialogVisible.value = true
}

// 页面加载时加载数据
// onMounted(() => {
//   store.loadFromStorage()
// })

</script>

<style scoped>
.data-manager-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.app-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #2d3748;
  color: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e4e7ed;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
  padding: 0 20px;
  border-bottom: 1px solid #4a5568;
}

.logo span {
  margin-left: 10px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background-color: transparent;
  color: #cbd5e0;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #cbd5e0;
  background-color: transparent;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #4a5568;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #3182ce;
  color: #fff;
}

.sidebar-menu :deep(.el-menu-item) .el-tag {
  margin-left: auto;
}

.progress-list-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin: 20px 0 10px 0;
  color: #a0aec0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.progress-list-title .el-icon {
  cursor: pointer;
  padding: 2px;
}

.progress-list-title .el-icon:hover {
  color: #409EFF;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #4a5568;
}

.about-btn {
  color: #a0aec0;
  width: 100%;
  text-align: left;
}

.about-btn:hover {
  color: #409EFF;
}

.main-content {
  padding: 0;
  background-color: #f7fafc;
  overflow: auto;
}

.about-content {
  text-align: center;
  padding: 20px 0;
}

.about-content h3 {
  margin-bottom: 10px;
  color: #409EFF;
}

.about-content p {
  margin: 8px 0;
  color: #666;
}

.about-content .copyright {
  margin-top: 20px;
  color: #999;
  font-size: 12px;
}
</style>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Element Plus 自定义样式 */
.el-button {
  font-weight: 500;
}

.el-dialog {
  border-radius: 8px;
}

.el-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-tag {
  border-radius: 12px;
}
</style>