import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

// 组件导入
import Home from './views/Home.vue'
import CreateProgress from './views/CreateProgress.vue'
import ProgressDetail from './views/ProgressDetail.vue'

// 路由配置
const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: {
            // title: '首页 - White Dew',
            requiresAuth: false
        }
    },
    {
        path: '/create-progress',
        name: 'CreateProgress',
        component: CreateProgress,
        meta: {
            // title: '创建进度 - White Dew',
            requiresAuth: false
        }
    },
    {
        path: '/progress/:id',
        name: 'ProgressDetail',
        component: ProgressDetail,
        props: true,
        meta: {
            // title: '进度详情 - White Dew',
            requiresAuth: false
        }
    },
    {
        path: '/data-management',
        name: 'DataManagement',
        component: () => import('./views/DataManagement.vue')
    },
    // 重定向
    {
        path: '/home',
        redirect: '/'
    },
    // 404 页面
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        redirect: '/'
    }
]

// 创建路由实例
const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // 返回页面顶部
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
    // 设置页面标题
    // if (to.meta.title) {
    //     document.title = to.meta.title
    // } else {
    //     document.title = 'White Dew - 招聘信息管理'
    // }

    // 这里可以添加权限验证逻辑
    if (to.meta.requiresAuth) {
        // 如果需要登录验证
        const isAuthenticated = true // 这里应该检查用户是否登录
        if (!isAuthenticated) {
            ElMessage.warning('请先登录')
            next('/')
        } else {
            next()
        }
    } else {
        next()
    }
})

// 全局后置钩子
router.afterEach((to, from) => {
    // 可以在这里添加页面跟踪等逻辑
    console.log(`路由跳转: ${from.path} -> ${to.path}`)
})

// 路由错误处理
router.onError((error) => {
    console.error('路由错误:', error)

    // 如果是 chunk 加载失败，可能是网络问题
    if (/loading chunk \d+ failed/.test(error.message)) {
        ElMessage.error('页面加载失败，请刷新重试')
        location.reload()
    }
})

// 导出路由实例
export default router

// 导出路由工具函数
export function useRouterUtils() {
    // 刷新当前路由
    const refreshRoute = () => {
        router.go(0)
    }

    // 返回上一页
    const goBack = () => {
        if (window.history.length > 1) {
            router.back()
        } else {
            router.push('/')
        }
    }

    // 获取当前路由参数
    const getRouteParams = () => {
        return router.currentRoute.value.params
    }

    // 获取当前路由查询参数
    const getRouteQuery = () => {
        return router.currentRoute.value.query
    }

    // 获取当前路由路径
    const getCurrentPath = () => {
        return router.currentRoute.value.path
    }

    // 判断当前路由是否匹配
    const isRouteActive = (routeName) => {
        return router.currentRoute.value.name === routeName
    }

    return {
        refreshRoute,
        goBack,
        getRouteParams,
        getRouteQuery,
        getCurrentPath,
        isRouteActive
    }
}