# SQLite 数据库集成指南

## 概述

项目已从 LocalStorage 升级到 SQLite 数据库，提供更好的性能、可靠性和数据管理能力。

## 为什么选择 SQLite？

### 优势
1. **高性能** - 比浏览器 LocalStorage 快得多
2. **容量无限制** - 不受浏览器存储限制
3. **SQL 支持** - 支持复杂查询和关系数据
4. **本地文件** - 数据存储在本地，完全可控
5. **事务支持** - 确保数据一致性
6. **Tauri 原生** - 完美集成 Tauri 桌面应用

### 与 LocalStorage 对比

| 特性 | LocalStorage | SQLite |
|------|-------------|---------|
| 容量 | 5-10MB | 无限制 |
| 性能 | 一般 | 优秀 |
| 查询 | 无 | 完整 SQL |
| 关系数据 | 不支持 | 完整支持 |
| 事务 | 不支持 | 完整支持 |
| 跨设备 | 否 | 是（通过文件） |

## 数据库结构

### 表结构

#### novels（小说表）
```sql
CREATE TABLE novels (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  cover TEXT,
  genre TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  word_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

#### chapters（章节表）
```sql
CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  novel_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  order_num INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  word_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  is_generated INTEGER DEFAULT 0,
  FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
)
```

#### prompts（提示词表）
```sql
CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

#### writing_goals（写作目标表）
```sql
CREATE TABLE writing_goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  target_words INTEGER NOT NULL,
  current_words INTEGER DEFAULT 0,
  period TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  streak_days INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
)
```

#### short_stories（短文表）
```sql
CREATE TABLE short_stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  genre TEXT,
  word_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

#### book_analyses（拆书分析表）
```sql
CREATE TABLE book_analyses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  summary TEXT,
  structure TEXT,
  themes TEXT,
  characters TEXT,
  writing_style TEXT NOT NULL,
  created_at TEXT NOT NULL
)
```

#### genres（类型表）
```sql
CREATE TABLE genres (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_popular INTEGER DEFAULT 0,
  count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
)
```

#### tools（工具表）
```sql
CREATE TABLE tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TEXT NOT NULL
)
```

#### billing_records（计费记录表）
```sql
CREATE TABLE billing_records (
  id TEXT PRIMARY KEY,
  model TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost REAL DEFAULT 0,
  status TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  error TEXT
)
```

#### settings（设置表）
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

## 使用指南

### 数据库初始化

数据库在应用启动时自动初始化：

```typescript
import { initDatabase } from '@/lib/database'

await initDatabase()
```

### CRUD 操作示例

#### 小说操作
```typescript
import * as dbService from '@/lib/dbService'

// 获取所有小说
const novels = await dbService.getAllNovels()

// 创建小说
const newNovel = await dbService.createNovel({
  title: '我的小说',
  author: '作者名',
  status: 'draft',
  wordCount: 0,
})

// 更新小说
await dbService.updateNovel(novel.id, {
  title: '新标题',
  wordCount: 1000,
})

// 删除小说
await dbService.deleteNovel(novel.id)
```

#### 章节操作
```typescript
// 获取小说的所有章节
const chapters = await dbService.getChaptersByNovelId(novelId)

// 创建章节
const newChapter = await dbService.createChapter({
  novelId: 'novel-123',
  title: '第一章',
  content: '章节内容',
  order: 1,
  status: 'draft',
  wordCount: 500,
})

// 更新章节
await dbService.updateChapter(chapter.id, {
  title: '新章节标题',
  wordCount: 1000,
})
```

#### 其他操作
所有其他数据类型（提示词、写作目标、短文等）都有类似的 CRUD 方法。

### Store 集成

新的 `useDbStore` 完全替代了原来的 `useNovelStore`，使用数据库作为后端：

```typescript
import { useDbStore } from '@/store/dbStore'

function MyComponent() {
  const store = useDbStore()

  // 添加小说（自动保存到数据库）
  const handleAddNovel = async () => {
    await store.addNovel({
      title: '新小说',
      status: 'draft',
      wordCount: 0,
    })
  }

  return <button onClick={handleAddNovel}>添加小说</button>
}
```

## 数据迁移

### 从 LocalStorage 迁移到 SQLite

应用会自动检测 LocalStorage 中的旧数据，并提供迁移选项：

1. 打开"系统设置" → "关于"
2. 如果检测到 LocalStorage 数据，会显示"迁移"按钮
3. 点击迁移按钮，确认迁移
4. 迁移完成后可选择清除 LocalStorage

### 迁移的数据

迁移工具会迁移以下所有数据：
- 小说（novels）
- 章节（chapters）
- 提示词（prompts）
- 写作目标（writingGoals）
- 短文（shortStories）
- 拆书分析（bookAnalyses）
- 应用设置（appSettings）

### 手动迁移

```typescript
import { shouldMigrate, migrateFromLocalStorage } from '@/lib/migration'

// 检查是否需要迁移
if (shouldMigrate()) {
  // 执行迁移
  await migrateFromLocalStorage()
}
```

## 数据库文件位置

### Windows
```
C:\Users\<用户名>\AppData\Roaming\xiezuo-tauri\noveldb.db
```

### macOS
```
~/Library/Application Support/com.xiezuo.tauri/noveldb.db
```

### Linux
```
~/.config/xiezuo-tauri/noveldb.db
```

## 数据备份与恢复

### 备份数据

应用内置了数据导出功能，可以将所有数据导出为 JSON 文件：

1. 打开"系统设置" → "数据管理"
2. 点击"导出数据"
3. 选择保存位置

### 恢复数据

1. 打开"系统设置" → "数据管理"
2. 点击"导入数据"
3. 选择备份的 JSON 文件
4. 确认导入

### 数据库文件备份

也可以直接复制数据库文件进行备份：

```bash
# 备份数据库文件
cp noveldb.db noveldb.db.backup
```

## 性能优化

### 索引

数据库已创建以下索引以提高查询性能：

```sql
CREATE INDEX idx_chapters_novel_id ON chapters(novel_id)
CREATE INDEX idx_billing_records_timestamp ON billing_records(timestamp)
CREATE INDEX idx_short_stories_genre ON short_stories(genre)
```

### 查询优化

- 使用 WHERE 子句过滤数据
- 利用索引字段进行查询
- 避免全表扫描

## 故障排除

### 数据库初始化失败

如果数据库初始化失败：

1. 检查应用是否有文件系统权限
2. 尝试删除现有数据库文件
3. 重启应用

### 迁移失败

如果迁移失败：

1. 检查控制台错误信息
2. 确认 LocalStorage 数据格式正确
3. 尝试手动导出数据后再导入

### 性能问题

如果遇到性能问题：

1. 检查数据库文件大小
2. 定期清理旧的计费记录
3. 使用 LIMIT 限制查询结果

## 最佳实践

1. **定期备份** - 定期导出数据备份
2. **清理旧数据** - 定期清理不需要的旧记录
3. **使用事务** - 批量操作时使用事务
4. **错误处理** - 所有数据库操作都应包含错误处理
5. **类型安全** - 使用 TypeScript 类型确保数据安全

## 后续优化

计划中的改进：

1. **全文搜索** - 添加 SQLite FTS5 支持全文搜索
2. **数据同步** - 添加云同步功能
3. **版本控制** - 添加数据版本控制和回滚
4. **性能监控** - 添加查询性能监控
5. **自动备份** - 定期自动备份

## 支持

如遇问题，请：

1. 查看控制台错误信息
2. 检查数据库文件完整性
3. 提交 Issue 到项目仓库

---

**注意**：SQLite 数据库是本地文件，请确保定期备份重要数据！
