import { useState, useEffect } from 'react'
import { useNovelStore } from '@/store/novelStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Card } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowUp,
  ArrowDown,
  Eye,
  Copy,
  Download,
} from 'lucide-react'
import { generateId, formatDate, countWords } from '@/lib/utils'
import type { Chapter, Novel } from '@/types'

export default function ChapterManagement() {
  const store = useNovelStore()
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [previewChapter, setPreviewChapter] = useState<Chapter | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft' as Chapter['status'],
  })

  useEffect(() => {
    if (selectedNovel) {
      setChapters(selectedNovel.chapters || [])
    } else {
      setChapters([])
    }
  }, [selectedNovel])

  // 过滤章节
  const filteredChapters = chapters
    .filter((chapter) => {
      const matchesSearch =
        chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || chapter.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => a.order - b.order)

  const handleOpenDialog = (chapter?: Chapter) => {
    if (chapter) {
      setEditingChapter(chapter)
      setFormData({
        title: chapter.title,
        content: chapter.content,
        status: chapter.status,
      })
    } else {
      setEditingChapter(null)
      setFormData({
        title: '',
        content: '',
        status: 'draft',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingChapter(null)
    setFormData({
      title: '',
      content: '',
      status: 'draft',
    })
  }

  const handleSave = () => {
    if (!formData.title.trim() || !selectedNovel) return

    const wordCount = countWords(formData.content)

    if (editingChapter) {
      // 更新现有章节
      const updatedChapter: Chapter = {
        ...editingChapter,
        title: formData.title,
        content: formData.content,
        status: formData.status,
        wordCount,
        updatedAt: new Date().toISOString(),
      }
      
      const updatedNovel: Novel = {
        ...selectedNovel,
        chapters: selectedNovel.chapters?.map(c => 
          c.id === editingChapter.id ? updatedChapter : c
        ) || [updatedChapter],
        updatedAt: new Date().toISOString(),
      }
      
      store.updateNovel(selectedNovel.id, updatedNovel)
      setChapters(updatedNovel.chapters || [])
    } else {
      // 创建新章节
      const newChapter: Chapter = {
        id: generateId(),
        novelId: selectedNovel.id,
        title: formData.title,
        content: formData.content,
        status: formData.status,
        wordCount,
        order: chapters.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isGenerated: false,
      }
      
      const updatedNovel: Novel = {
        ...selectedNovel,
        chapters: [...(selectedNovel.chapters || []), newChapter],
        updatedAt: new Date().toISOString(),
      }
      
      store.updateNovel(selectedNovel.id, updatedNovel)
      setChapters(updatedNovel.chapters || [])
    }

    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个章节吗？此操作不可恢复。')) {
      const updatedChapters = chapters.filter(chapter => chapter.id !== id)
      
      // 重新排序
      const reorderedChapters = updatedChapters.map((chapter, index) => ({
        ...chapter,
        order: index + 1,
      }))
      
      if (selectedNovel) {
        const updatedNovel: Novel = {
          ...selectedNovel,
          chapters: reorderedChapters,
          updatedAt: new Date().toISOString(),
        }
        
        store.updateNovel(selectedNovel.id, updatedNovel)
        setChapters(reorderedChapters)
      }
    }
  }

  const handleMoveChapter = (chapterId: string, direction: 'up' | 'down') => {
    const currentIndex = chapters.findIndex(c => c.id === chapterId)
    if (currentIndex < 0) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= chapters.length) return

    const newChapters = [...chapters]
    const temp = newChapters[currentIndex]
    newChapters[currentIndex] = newChapters[newIndex]
    newChapters[newIndex] = temp

    // 更新 order
    const reorderedChapters = newChapters.map((chapter, index) => ({
      ...chapter,
      order: index + 1,
    }))

    if (selectedNovel) {
      const updatedNovel: Novel = {
        ...selectedNovel,
        chapters: reorderedChapters,
        updatedAt: new Date().toISOString(),
      }
      
      store.updateNovel(selectedNovel.id, updatedNovel)
      setChapters(reorderedChapters)
    }
  }

  const handlePreview = (chapter: Chapter) => {
    setPreviewChapter(chapter)
    setIsPreviewOpen(true)
  }

  const handleCopy = (chapter: Chapter) => {
    navigator.clipboard.writeText(chapter.content)
    alert('内容已复制到剪贴板')
  }

  const handleExport = () => {
    if (!selectedNovel) return

    const fullText = chapters.map(chapter => {
      return `第${chapter.order}章 ${chapter.title}\n\n${chapter.content}\n\n---\n\n`
    }).join('\n')

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedNovel.title}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStatusText = (status: Chapter['status']) => {
    switch (status) {
      case 'draft':
        return '草稿'
      case 'in_progress':
        return '创作中'
      case 'completed':
        return '已完成'
    }
  }

  const stats = {
    total: chapters.length,
    draft: chapters.filter((c) => c.status === 'draft').length,
    inProgress: chapters.filter((c) => c.status === 'in_progress').length,
    completed: chapters.filter((c) => c.status === 'completed').length,
    totalWords: chapters.reduce((sum, c) => sum + c.wordCount, 0),
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 标题和统计 */}
      <div>
        <h1 className="text-2xl font-bold mb-4">章节管理</h1>
        {!selectedNovel ? (
          <Card className="p-6">
            <p className="text-muted-foreground text-center">请先选择一部小说管理章节</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">总章节数</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-gray-500">{stats.draft}</div>
              <div className="text-sm text-muted-foreground">草稿</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">创作中</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">已完成</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-purple-500">
                {(stats.totalWords / 10000).toFixed(1)}万
              </div>
              <div className="text-sm text-muted-foreground">总字数</div>
            </Card>
          </div>
        )}
      </div>

      {/* 小说选择和工具栏 */}
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>选择小说</Label>
              <Select value={selectedNovel?.id || ''} onValueChange={(value) => {
                const novel = store.novels.find(n => n.id === value)
                setSelectedNovel(novel || null)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="选择要管理章节的小说" />
                </SelectTrigger>
                <SelectContent>
                  {store.novels.map(novel => (
                    <SelectItem key={novel.id} value={novel.id}>{novel.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedNovel && (
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出全文
              </Button>
            )}
          </div>
        </Card>

        {selectedNovel && (
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索章节标题或内容..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="in_progress">创作中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    新建章节
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingChapter ? '编辑章节' : '新建章节'}</DialogTitle>
                    <DialogDescription>
                      {editingChapter ? '修改章节内容' : '创建一个新的章节'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="chapter-title">标题 *</Label>
                      <Input
                        id="chapter-title"
                        placeholder="章节标题"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chapter-status">状态</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: Chapter['status']) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger id="chapter-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">草稿</SelectItem>
                          <SelectItem value="in_progress">创作中</SelectItem>
                          <SelectItem value="completed">已完成</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chapter-content">内容</Label>
                      <Textarea
                        id="chapter-content"
                        placeholder="章节内容..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={15}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleCloseDialog}>
                      取消
                    </Button>
                    <Button onClick={handleSave}>{editingChapter ? '保存' : '创建'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        )}
      </div>

      {/* 章节列表 */}
      {selectedNovel && (
        <div className="flex-1 overflow-auto">
          {filteredChapters.length === 0 ? (
            <Card className="p-12 flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg mb-2">暂无章节</p>
              <p className="text-sm">点击上方"新建章节"按钮开始创作</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredChapters.map((chapter) => (
                <Card key={chapter.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          第{chapter.order}章
                        </span>
                        <h3 className="font-semibold text-lg">{chapter.title}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {getStatusText(chapter.status)}
                        </span>
                        {chapter.isGenerated && (
                          <span className="text-xs bg-purple-10 text-purple-600 px-2 py-0.5 rounded-full">
                            AI生成
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {chapter.content || '暂无内容'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{chapter.wordCount} 字</span>
                        <span>{formatDate(chapter.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveChapter(chapter.id, 'up')}
                        disabled={chapter.order === 1}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveChapter(chapter.id, 'down')}
                        disabled={chapter.order === chapters.length}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handlePreview(chapter)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(chapter)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(chapter)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(chapter.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 预览对话框 */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              第{previewChapter?.order}章 {previewChapter?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {previewChapter?.content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
