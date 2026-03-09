# 91写作项目完整迁移指南

本文档详细说明如何将原 Vue 3 + Element Plus 项目完整迁移到新技术栈：React + Radix UI + Tailwind CSS + Tauri 2 + FastAPI。

## 目录

1. [项目对比](#项目对比)
2. [组件迁移映射](#组件迁移映射)
3. [逐步迁移指南](#逐步迁移指南)
4. [API服务迁移](#api服务迁移)
5. [状态管理迁移](#状态管理迁移)
6. [样式迁移](#样式迁移)
7. [测试清单](#测试清单)

## 项目对比

### 原项目技术栈
- Vue 3 (Composition API)
- Vite
- Element Plus UI库
- Pinia 状态管理
- @wangeditor/editor 富文本编辑器
- Axios HTTP客户端
- 纯前端架构

### 新项目技术栈
- React 18 (Hooks)
- Vite
- Radix UI (无样式组件)
- Tailwind CSS (样式)
- Pinia 状态管理
- Tiptap (基于ProseMirror)
- Axios HTTP客户端
- Tauri 2 桌面应用框架
- FastAPI 后端服务

## 组件迁移映射

### 1. 主布局和路由

| 原组件 | 新组件 | 状态 |
|--------|--------|------|
| `src/App.vue` | `src/App.tsx` | ✅ 完成 |
| `src/views/Dashboard.vue` | `src/components/Dashboard.tsx` | ✅ 完成 |

### 2. 核心页面组件

| 原组件 | 新组件 | 状态 |
|--------|--------|------|
| `src/views/Home.vue` | `src/components/HomePage.tsx` | ✅ 完成 |
| `src/views/Writer.vue` | `src/components/Writer.tsx` | ⏳ 待迁移 |
| `src/views/ShortStory.vue` | `src/components/ShortStory.tsx` | ⏳ 待迁移 |
| `src/views/NovelManagement.vue` | `src/components/NovelManagement.tsx` | ⏳ 待迁移 |
| `src/views/PromptsLibrary.vue` | `src/components/PromptsLibrary.tsx` | ⏳ 待迁移 |
| `src/views/ToolsLibrary.vue` | `src/components/ToolsLibrary.tsx` | ⏳ 待迁移 |
| `src/views/ChapterManagement.vue` | `src/components/ChapterManagement.tsx` | ⏳ 待迁移 |
| `src/views/WritingGoals.vue` | `src/components/WritingGoals.tsx` | ⏳ 待迁移 |
| `src/views/TokenBilling.vue` | `src/components/TokenBilling.tsx` | ⏳ 待迁移 |
| `src/views/BookAnalysis.vue` | `src/components/BookAnalysis.tsx` | ⏳ 待迁移 |
| `src/views/GenreManagement.vue` | `src/components/GenreManagement.tsx` | ⏳ 待迁移 |
| `src/views/ApiConfig.vue` | `src/components/ApiConfig.tsx` | ⏳ 待迁移 |
| `src/views/Settings.vue` | `src/components/Settings.tsx` | ⏳ 待迁移 |

### 3. 子组件

| 原组件 | 新组件 | 状态 |
|--------|--------|------|
| `src/components/TemplateManager.vue` | `src/components/TemplateManager.tsx` | ⏳ 待迁移 |
| `src/components/CorpusManager.vue` | `src/components/CorpusManager.tsx` | ⏳ 待迁移 |
| `src/components/ApiConfig.vue` | `src/components/ApiConfig.tsx` | ⏳ 待迁移 |

## 快速开始

### 迁移单个组件示例

以Writer组件为例，展示完整的迁移过程：

1. **分析原组件结构**（`src/views/Writer.vue` - 11206行）
2. **创建新的React组件**（`src/components/Writer.tsx`）
3. **迁移状态管理**（使用Pinia store）
4. **迁移UI**（使用Radix UI + Tailwind）
5. **迁移编辑器**（从@wangeditor到Tiptap）
6. **测试功能**

### 核心迁移模式

#### Vue → React 转换

```vue
<!-- Vue -->
<template>
  <div>
    <el-input v-model="inputValue" />
    <el-button @click="handleClick">点击</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const inputValue = ref('')
const handleClick = () => {
  console.log(inputValue.value)
}
</script>
```

```tsx
// React
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function Component() {
  const [inputValue, setInputValue] = useState('')
  
  const handleClick = () => {
    console.log(inputValue)
  }
  
  return (
    <div>
      <Input 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <Button onClick={handleClick}>点击</Button>
    </div>
  )
}
```

## 已完成的基础设施

### ✅ 项目基础
- Tauri 2 + Vite 项目架构
- Tailwind CSS 配置
- Radix UI 基础组件
- TypeScript 类型定义
- 路由配置

### ✅ 核心服务
- API服务层（完整实现）
- 计费服务（完整实现）
- 状态管理（Pinia store）

### ✅ 核心组件
- Dashboard 主布局
- HomePage 首页

### ✅ 后端服务
- FastAPI 基础架构
- OpenAI API 代理
- CORS 支持

## 下一步工作

根据MIGRATION_GUIDE.md中的详细指导，逐个迁移剩余组件。

## 参考资料

- 原项目位置: `d:/Github/gitub/91xiezuo1/`
- 新项目位置: `d:/Github/gitub/91xiezuo1/91xiezuo-tauri/`
