import { useState, useEffect } from 'react'
import { useNovelStore } from '@/store/novelStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Card } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Upload,
  Tag,
  FileText,
  Copy,
  Check,
} from 'lucide-react'
import { generateId, formatDate, copyToClipboard, downloadFile } from '@/lib/utils'
import type { Prompt } from '@/types'

const CATEGORIES = [
  '通用',
  '大纲生成',
  '章节创作',
  '人物设定',
  '世界观',
  '金手指',
  '开篇',
  '简介',
  '冲突',
  '高潮',
  '结局',
]

export default function PromptsLibrary() {
  const store = useNovelStore()
  const [prompts, setPrompts] = useState<Prompt[]>(store.prompts)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: '通用',
    tags: [] as string[],
  })

  useEffect(() => {
    setPrompts(store.prompts)
  }, [store.prompts])

  // 过滤提示词
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || prompt.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleOpenDialog = (prompt?: Prompt) => {
    if (prompt) {
      setEditingPrompt(prompt)
      setFormData({
        name: prompt.name,
        content: prompt.content,
        category: prompt.category,
        tags: prompt.tags,
      })
    } else {
      setEditingPrompt(null)
      setFormData({
        name: '',
        content: '',
        category: '通用',
        tags: [],
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPrompt(null)
    setFormData({
      name: '',
      content: '',
      category: '通用',
      tags: [],
    })
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.content.trim()) return

    if (editingPrompt) {
      // 更新现有提示词
      const updatedPrompt: Prompt = {
        ...editingPrompt,
        name: formData.name,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        updatedAt: new Date().toISOString(),
      }
      store.updatePrompt(editingPrompt.id, updatedPrompt)
    } else {
      // 创建新提示词
      const newPrompt: Prompt = {
        id: generateId(),
        name: formData.name,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      store.addPrompt(newPrompt)
    }

    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个提示词吗？')) {
      store.removePrompt(id)
    }
  }

  const handleCopy = async (content: string, id: string) => {
    await copyToClipboard(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleExport = () => {
    const data = JSON.stringify(prompts, null, 2)
    downloadFile(data, 'prompts-export.json', 'application/json')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedPrompts: Prompt[] = JSON.parse(event.target?.result as string)
        importedPrompts.forEach((prompt) => {
          store.addPrompt({
            ...prompt,
            id: generateId(), // 生成新ID避免冲突
          })
        })
        alert(`成功导入 ${importedPrompts.length} 个提示词`)
      } catch (error) {
        alert('导入失败：文件格式不正确')
      }
    }
    reader.readAsText(file)
    e.target.value = '' // 重置文件输入
  }

  const stats = {
    total: prompts.length,
    categories: new Set(prompts.map((p) => p.category)).size,
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 标题和统计 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">提示词库</h1>
          <p className="text-sm text-muted-foreground mt-1">
            共 {stats.total} 个提示词，{stats.categories} 个分类
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            导入
          </Button>
          <input
            id="import-file"
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索提示词名称、内容或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue placeholder="分类筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                新建提示词
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingPrompt ? '编辑提示词' : '新建提示词'}</DialogTitle>
                <DialogDescription>
                  {editingPrompt ? '修改提示词内容' : '创建一个新的提示词'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">名称 *</Label>
                  <Input
                    id="name"
                    placeholder="提示词名称"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">标签（用逗号分隔）</Label>
                  <Input
                    id="tags"
                    placeholder="如：大纲, 创意, 玄幻"
                    value={formData.tags.join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">提示词内容 *</Label>
                  <Textarea
                    id="content"
                    placeholder="请输入提示词内容..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  取消
                </Button>
                <Button onClick={handleSave}>{editingPrompt ? '保存' : '创建'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* 提示词列表 */}
      <div className="flex-1 overflow-auto">
        {filteredPrompts.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg mb-2">暂无提示词</p>
            <p className="text-sm">点击上方"新建提示词"按钮开始创建</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{prompt.name}</h3>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                      {prompt.category}
                    </span>
                  </div>

                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {prompt.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex-1 mb-4">
                    <p className="text-sm text-muted-foreground line-clamp-4">{prompt.content}</p>
                  </div>

                  <div className="text-xs text-muted-foreground mb-3">
                    {formatDate(prompt.updatedAt)}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCopy(prompt.content, prompt.id)}
                    >
                      {copiedId === prompt.id ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          复制
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(prompt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(prompt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
