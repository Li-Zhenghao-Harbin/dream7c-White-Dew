# 开发环境安装指南

## 1. 环境要求

- 操作系统：Windows 10/11（项目当前脚本已按 Windows 适配）
- Node.js：推荐 `18.x LTS`（建议同时安装 npm 9+）
- Git：用于拉取与更新代码

可使用以下命令确认版本：

```bash
node -v
npm -v
git --version
```

## 2. 镜像源配置（国内）

本项目已在根目录提供 `.npmrc`，默认使用阿里系 `npmmirror` 作为 npm registry。

当前默认配置（npm）：

- npm registry：`https://registry.npmmirror.com/`

### 可选：切换为清华源

如果你希望统一切到清华源，可在项目根目录执行：

```bash
npm config set registry https://mirrors.tuna.tsinghua.edu.cn/npm/
```

如需还原为项目默认（阿里系）：

```bash
npm config set registry https://registry.npmmirror.com/
```

## 3. 安装依赖

在项目根目录执行（推荐，含 Electron 镜像）：

```powershell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"
npm install
```

如果只安装 npm 依赖（不触发 Electron 下载），可直接执行：

```bash
npm install
```

## 4. 启动开发环境

### 仅启动前端（Vite）

```bash
npm run dev
```

### 启动 Electron + Vue 联调

```bash
npm run electron:dev
```

## 5. 构建与打包

### 构建前端资源

```bash
npm run build
```

### 打包 Electron 安装程序

```bash
npm run electron:build
```

### 打包并运行产物（Windows）

```bash
npm run electron:build-and-run
```

## 6. 常见问题

### 依赖下载慢或失败

1. 确认网络可访问 `npmmirror.com`。
2. 重新执行安装：

```bash
npm cache clean --force
npm install
```

### Electron 下载失败

如果本机存在全局 npm 配置覆盖，建议在当前终端显式设置后再安装：

```powershell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"
npm install
```
