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
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  PauseCircle,
} from 'lucide-react'
import { generateId, formatDate } from '@/lib/utils'
import type { Novel } from '@/types'

export default function NovelManagement() {
  const store = useNovelStore()
  const [novels, setNovels] = useState<Novel[]>(store.novels)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updatedAt')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    status: 'draft' as Novel['status'],
  })

  useEffect(() => {
    setNovels(store.novels)
  }, [store.novels])

  // 过滤和排序小说
  const filteredNovels = novels
    .filter((novel) => {
      const matchesSearch =
        novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (novel.author && novel.author.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || novel.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'wordCount':
          return b.wordCount - a.wordCount
        case 'title':
          return a.title.localeCompare(b.title, 'zh-CN')
        default:
          return 0
      }
    })

  const handleOpenDialog = (novel?: Novel) => {
    if (novel) {
      setEditingNovel(novel)
      setFormData({
        title: novel.title,
        author: novel.author || '',
        description: novel.description || '',
        genre: novel.genre || '',
        status: novel.status,
      })
    } else {
      setEditingNovel(null)
      setFormData({
        title: '',
        author: '',
        description: '',
        genre: '',
        status: 'draft',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingNovel(null)
    setFormData({
      title: '',
      author: '',
      description: '',
      genre: '',
      status: 'draft',
    })
  }

  const handleSave = () => {
    if (!formData.title.trim()) return

    if (editingNovel) {
      // 更新现有小说
      const updatedNovel: Novel = {
        ...editingNovel,
        title: formData.title,
        author: formData.author,
        description: formData.description,
        genre: formData.genre,
        status: formData.status,
        updatedAt: new Date().toISOString(),
      }
      store.updateNovel(editingNovel.id, updatedNovel)
    } else {
      // 创建新小说
      const newNovel: Novel = {
        id: generateId(),
        title: formData.title,
        author: formData.author,
        description: formData.description,
        genre: formData.genre,
        status: formData.status,
        wordCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      store.addNovel(newNovel)
    }

    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这部小说吗？此操作不可恢复。')) {
      store.removeNovel(id)
    }
  }

  const getStatusIcon = (status: Novel['status']) => {
    switch (status) {
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'paused':
        return <PauseCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: Novel['status']) => {
    switch (status) {
      case 'draft':
        return '草稿'
      case 'in_progress':
        return '创作中'
      case 'completed':
        return '已完成'
      case 'paused':
        return '已暂停'
    }
  }

  const stats = {
    total: novels.length,
    drafting: novels.filter((n) => n.status === 'draft').length,
    inProgress: novels.filter((n) => n.status === 'in_progress').length,
    completed: novels.filter((n) => n.status === 'completed').length,
    totalWords: novels.reduce((sum, n) => sum + n.wordCount, 0),
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 标题和统计 */}
      <div>
        <h1 className="text-2xl font-bold mb-4">小说管理</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">总小说数</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-500">{stats.drafting}</div>
            <div className="text-sm text-muted-foreground">草稿</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-500">{stats.inProgress}</div>
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
      </div>

      {/* 工具栏 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索小说标题或作者..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="in_progress">创作中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="paused">已暂停</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">更新时间</SelectItem>
              <SelectItem value="createdAt">创建时间</SelectItem>
              <SelectItem value="wordCount">字数</SelectItem>
              <SelectItem value="title">标题</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                新建小说
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingNovel ? '编辑小说' : '新建小说'}</DialogTitle>
                <DialogDescription>
                  {editingNovel ? '修改小说信息' : '创建一部新的小说'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">标题 *</Label>
                  <Input
                    id="title"
                    placeholder="小说标题"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">作者</Label>
                  <Input
                    id="author"
                    placeholder="作者名称"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">类型</Label>
                  <Input
                    id="genre"
                    placeholder="如：玄幻、都市、科幻..."
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">状态</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Novel['status']) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">草稿</SelectItem>
                      <SelectItem value="in_progress">创作中</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="paused">已暂停</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">简介</Label>
                  <Textarea
                    id="description"
                    placeholder="小说简介..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  取消
                </Button>
                <Button onClick={handleSave}>{editingNovel ? '保存' : '创建'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* 小说列表 */}
      <div className="flex-1 overflow-auto">
        {filteredNovels.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <BookOpen className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg mb-2">暂无小说</p>
            <p className="text-sm">点击上方"新建小说"按钮开始创作</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNovels.map((novel) => (
              <Card key={novel.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                {/* 封面区域 */}
                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-primary/40" />
                </div>

                {/* 内容区域 */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{novel.title}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      {getStatusIcon(novel.status)}
                      <span className="text-muted-foreground">{getStatusText(novel.status)}</span>
                    </div>
                  </div>

                  {novel.author && (
                    <p className="text-sm text-muted-foreground mb-2">作者：{novel.author}</p>
                  )}

                  {novel.genre && (
                    <div className="mb-2">
                      <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                        {novel.genre}
                      </span>
                    </div>
                  )}

                  {novel.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{novel.description}</p>
                  )}

                  <div className="mt-auto pt-2 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {novel.wordCount.toLocaleString()} 字
                    </span>
                    <span className="text-muted-foreground">{formatDate(novel.updatedAt)}</span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenDialog(novel)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(novel.id)}
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
