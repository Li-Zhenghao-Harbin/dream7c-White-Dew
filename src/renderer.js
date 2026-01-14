import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { useRecruitmentStore } from './store'

const app = createApp(App)
const pinia = createPinia()

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
    console.error('Vue 错误:', err)
    console.error('组件:', vm)
    console.error('信息:', info)
}

// 使用插件
app.use(pinia)
app.use(ElementPlus)
app.use(router)

// 挂载应用
app.mount('#app')

// 全局加载数据
const store = useRecruitmentStore()
store.loadFromStorage()

// 右键菜单
window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    if (window.electronAPI) {
        window.electronAPI.showContextMenu()
    }
})