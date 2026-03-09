# 91写作 - AI小说创作工具 (Tauri 2 版本)

完整复刻原 Vue 3 项目到现代化技术栈：Yjs + ProseMirror + Radix UI + Tailwind CSS + Tauri 2 + FastAPI

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **桌面框架**: Tauri 2
- **UI组件库**: Radix UI (Headless UI组件)
- **样式**: Tailwind CSS
- **富文本编辑器**: Tiptap (基于ProseMirror)
- **实时协作**: Yjs
- **状态管理**: Pinia
- **路由**: React Router 6
- **HTTP客户端**: Axios
- **图标**: Lucide React

### 后端
- **框架**: FastAPI (Python)
- **HTTP客户端**: httpx
- **CORS**: 完整支持

## 项目结构

```
91xiezuo-tauri/
├── src/                      # 前端源代码
│   ├── components/           # React组件
│   │   ├── ui/               # Radix UI基础组件
│   │   ├── Dashboard.tsx     # 主布局
│   │   ├── HomePage.tsx      # 首页
│   │   ├── Writer.tsx        # 小说编辑器
│   │   └── ...               # 其他页面组件
│   ├── store/                # Pinia状态管理
│   │   └── novelStore.ts     # 小说状态管理
│   ├── services/             # 服务层
│   │   ├── api.ts            # API服务
│   │   └── billing.ts        # 计费服务
│   ├── types/                # TypeScript类型定义
│   ├── lib/                  # 工具函数
│   └── main.tsx              # 应用入口
├── backend/                  # FastAPI后端
│   ├── main.py               # FastAPI应用
│   └── requirements.txt     # Python依赖
├── src-tauri/               # Tauri原生代码
│   └── src/                  # Rust代码
├── package.json
└── vite.config.ts
```

## 快速开始

### 前置要求

1. **Node.js** 18+
2. **Python** 3.9+
3. **Rust** (Tauri需要)
4. **系统依赖**: 查看https://tauri.app/start/prerequisites/

### 安装依赖

前端：
```bash
cd 91xiezuo-tauri
npm install
```

后端：
```bash
cd backend
pip install -r requirements.txt
```

### 配置环境变量

后端配置：
```bash
cd backend
cp .env.example .env
# 编辑.env配置API密钥
```

### 启动项目

#### 开发模式（同时启动前后端）

终端1 - 启动后端：
```bash
cd backend
uvicorn main:app --reload
```

终端2 - 启动前端：
```bash
cd 91xiezuo-tauri
npm run tauri dev
```

#### 生产构建

```bash
# 构建桌面应用
npm run tauri build

# 输出位置
# Windows: src-tauri/target/release/bundle/msi/
# macOS: src-tauri/target/release/bundle/dmg/
# Linux: src-tauri/target/release/bundle/deb/
```

## 功能特性

### ✅ 已实现的功能

1. **创作功能**
   - 智能大纲生成（流式）
   - 章节内容生成
   - AI写作助手对话
   - 人物设定生成
   - 世界观设定生成

2. **编辑功能**
   - 富文本编辑器（Tiptap + ProseMirror）
   - 实时字数统计
   - 内容导出（TXT）
   - 多标签页编辑

3. **管理功能**
   - 小说项目管理
   - 章节管理
   - 提示词库管理
   - 模板管理
   - 语料库管理
   - 写作目标跟踪
   - 备份管理

4. **工具库**
   - 细纲生成器
   - 金手指生成器
   - 黄金开篇生成器
   - 爆款书名生成器
   - 爆款题材生成器
   - 脑洞生成器
   - 简介生成器
   - 宏大世界观生成器
   - 角色生成器
   - 冲突生成器

5. **API配置**
   - 双模式配置（官方+自定义）
   - 多模型支持
   - OpenAI格式API兼容
   - 流式生成支持

6. **计费系统**
   - Token使用统计
   - 费用计算
   - 使用趋势图表
   - 数据导出

7. **数据管理**
   - LocalStorage持久化
   - 备份恢复
   - 数据导入/导出

8. **用户体验**
   - 响应式设计
   - 暗色主题支持
   - 侧边栏折叠
   - 加载状态提示

## 与原项目的差异

### 技术栈对比

| 功能 | 原项目 | 新项目 |
|------|--------|--------|
| 框架 | Vue 3 | React 18 |
| 构建工具 | Vite | Vite |
| UI组件库 | Element Plus | Radix UI |
| 样式 | CSS + Element Plus主题 | Tailwind CSS |
| 编辑器 | @wangeditor/editor | Tiptap (ProseMirror) |
| 状态管理 | Pinia | Pinia |
| 运行环境 | Web浏览器 | Tauri桌面应用 |
| 后端 | 无（纯前端） | FastAPI |

### 功能完整性

✅ 所有原项目功能都已复刻
✅ UI/UX 保持一致
✅ 数据格式兼容
✅ API接口相同

## 开发指南

### 添加新页面

1. 在 `src/components/` 创建新组件
2. 在 `src/App.tsx` 添加路由
3. 在 `Dashboard.tsx` 添加导航菜单项

### 添加新工具

1. 在 `src/components/ToolsLibrary.tsx` 添加工具
2. 在 `src/services/api.ts` 添加API调用方法
3. 更新类型定义

### 自定义样式

使用Tailwind CSS工具类，项目已配置完整的主题系统。

## 架构说明

### 前端架构

```
┌─────────────────────────────────────┐
│         Tauri Desktop App            │
├─────────────────────────────────────┤
│         React Application            │
├─────────────────────────────────────┤
│  Components (Radix UI + Tailwind)   │
├─────────────────────────────────────┤
│  State Management (Pinia)           │
├─────────────────────────────────────┤
│  Services (API + Billing)          │
├─────────────────────────────────────┤
│  Rich Text Editor (Tiptap)          │
└─────────────────────────────────────┘
         ↓ HTTP
┌─────────────────────────────────────┐
│         FastAPI Backend             │
└─────────────────────────────────────┘
         ↓ HTTP
┌─────────────────────────────────────┐
│   OpenAI/Custom AI API              │
└─────────────────────────────────────┘
```

### 数据流

1. 用户操作 → 组件事件
2. 组件 → Pinia Store (状态更新)
3. Store → API Service (HTTP请求)
4. API Service → FastAPI Backend
5. Backend → AI API
6. 响应 → UI更新

## 部署

### 桌面应用

```bash
npm run tauri build
```

### 后端部署

使用 Docker：

```bash
docker build -t 91xiezuo-api backend/
docker run -p 8000:8000 91xiezuo-api
```

## 常见问题

### Q: 为什么选择Tauri 2而不是Electron？
A: Tauri 2 更轻量（应用体积小10倍+），性能更好，安全性更高，使用系统原生组件。

### Q: 为什么选择Radix UI而不是shadcn/ui？
A: Radix UI 是shadcn/ui的基础，提供无样式的可访问组件。我们使用Tailwind CSS自定义样式，获得更大的灵活性。

### Q: 为什么添加FastAPI后端？
A: 虽然原项目是纯前端，但添加后端可以：
- 更好的API密钥管理
- 数据持久化到数据库
- 后台任务处理
- 更好的安全性

### Q: 编辑器为什么选择Tiptap？
A: Tiptap基于ProseMirror，提供：
- 更好的性能
- 更灵活的扩展性
- 与Yjs完美集成（实时协作）
- 更强大的自定义能力

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 致谢

- 原项目：91写作 (Vue 3 + Element Plus)
- Tauri：https://tauri.app
- React：https://react.dev
- Radix UI：https://www.radix-ui.com
- Tiptap：https://tiptap.dev
- FastAPI：https://fastapi.tiangolo.com
