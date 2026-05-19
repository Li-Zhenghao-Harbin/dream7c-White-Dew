# 柒幻 白露

<img src="http://www.dream7c.com/images/dream7c%20WD%20logo.png" width="128" height="128" />

> **柒幻 白露** 是柒幻工作室于 2026 年 1 月推出的一款桌面端招聘记录管理软件，帮助求职者系统化地记录和跟踪每一次投递、面试与结果，让招聘进度一目了然。

## 功能特性

- **多进度管理** — 按招聘季（秋招 / 春招 / 暑期实习等）分别创建独立进度，互不干扰
- **招聘记录 CRUD** — 记录公司名称、行业、岗位、城市、投递日期、待遇、备注等完整信息
- **流程阶段跟踪** — 为每条记录维护多个流程节点（投递 → 笔试 → 一面 → 二面 → HR 面 → offer），附带日期与备注
- **10 种结果状态** — 待投递、进行中、未参加、招满/取消、简历挂、测评挂、笔试挂、面试挂、offer、已拒绝
- **搜索与筛选** — 表格内按关键词搜索、按状态筛选，快速定位目标记录
- **数据统计** — ECharts 环形饼图可视化展示各状态分布占比
- **数据备份与恢复** — 一键导出 / 导入 JSON 文件，数据不丢失
- **自动保存** — 每 30 秒自动保存，页面隐藏或关闭时也会自动触发保存
- **全屏模式** — 表格支持全屏浏览，专注查看记录

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3.4（Composition API + `<script setup>`） |
| 桌面框架 | Electron 25 |
| 构建工具 | Vite 4 |
| UI 组件库 | Element Plus 2.4 |
| 状态管理 | Pinia 2.1 |
| 路由 | Vue Router 4（Hash 模式） |
| 图表 | ECharts 6 |
| 日期处理 | Day.js |
| 打包 | electron-builder（Windows NSIS 安装包） |

## 项目结构

```
dream7c-White-Dew/
├── index.html                  # Vite 入口 HTML
├── vite.config.js              # Vite 构建配置
├── package.json                # 依赖与脚本
├── .npmrc                      # npm 镜像源配置
│
├── src/
│   ├── main.js                 # Electron 主进程
│   ├── preload.js              # Electron 预加载脚本（IPC 桥接）
│   ├── renderer.js             # Vue 渲染进程入口
│   ├── App.vue                 # 根组件（自动保存、国际化）
│   ├── router.js               # 路由配置
│   ├── store.js                # Pinia 状态管理
│   │
│   ├── views/
│   │   ├── Home.vue            # 首页 — 进度卡片总览
│   │   ├── CreateProgress.vue  # 新建招聘进度
│   │   ├── ProgressDetail.vue  # 进度详情 — 记录表格（核心页面）
│   │   └── DataManagement.vue  # 数据管理页面
│   │
│   ├── components/
│   │   ├── RecordForm.vue      # 招聘记录表单（新增 / 编辑）
│   │   ├── StageForm.vue       # 流程阶段查看
│   │   ├── StatisticForm.vue   # ECharts 统计饼图
│   │   ├── DataManager.vue     # 数据管理对话框
│   │   └── About.vue           # 关于对话框
│   │
│   └── utils/
│       └── storage.js          # 数据持久化层
│
└── public/W
    └── index.html              # 遗留模板（未使用）
```

### 核心使用步骤

1. **创建招聘进度** — 在首页点击「新建进度」，填写名称（如「2026 秋招」）、描述和标签
2. **添加招聘记录** — 进入进度详情页，点击「添加记录」，填写公司、岗位、投递日期等信息
3. **跟踪流程阶段** — 每条记录可添加多个流程节点（投递 → 笔试 → 一面 → 二面 → HR 面），并记录每个阶段的日期和备注
4. **更新招聘结果** — 随着进展修改状态：进行中 → offer / 面试挂 / 简历挂等
5. **查看统计分析** — 点击「统计」按钮，通过饼图直观了解各状态比例
6. **数据管理** — 随时备份数据为 JSON 文件，需要时可导入恢复

## 数据存储

应用采用**双层持久化策略**：

| 层级 | 存储位置 | 说明 |
|------|---------|------|
| 主存储 | `localStorage`（键名 `white_dew_data`） | 浏览器 / Electron 均可用，每次保存优先写入 |
| 文件备份 | `{userData}/white_dew_data.json` | 仅 Electron 环境，异步写入文件系统 |
| 自动备份 | `{userData}/backups/` | Electron 写入前自动备份，保留最近 5 份 |

## 快速开始

### 环境要求

- Node.js 18.x LTS
- npm 9+
- Git

### 安装依赖

```powershell
# 设置 Electron 镜像（国内加速）
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"

npm install
```

> 项目已配置 `.npmrc`，npm 包默认从阿里系镜像 `registry.npmmirror.com` 下载。

### 开发运行

```bash
# 仅启动前端（Vite，端口 3000）
npm run dev

# 启动 Electron + Vue 联调
npm run electron:dev
```

### 构建打包

```bash
# 构建前端资源
npm run build

# 打包 Windows 安装程序（NSIS）
npm run electron:build

# 打包并直接运行
npm run electron:build-and-run
```

> 详细安装说明请参阅 [SETUP.md](./SETUP.md)。