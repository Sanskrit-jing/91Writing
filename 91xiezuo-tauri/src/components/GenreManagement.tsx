import { useState, useEffect } from 'react'
import { useNovelStore } from '@/store/novelStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Palette,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react'
import { generateId } from '@/lib/utils'

interface Genre {
  id: string
  name: string
  description: string
  color: string
  icon: string
  isPopular: boolean
  count: number
  createdAt: string
}

const defaultGenres: Genre[] = [
  { id: '1', name: '玄幻', description: '包含修仙、魔法、异能等元素', color: '#8B5CF6', icon: '⚡', isPopular: true, count: 0, createdAt: new Date().toISOString() },
  { id: '2', name: '都市', description: '现代都市背景的网络小说', color: '#3B82F6', icon: '🏙️', isPopular: true, count: 0, createdAt: new Date().toISOString() },
  { id: '3', name: '科幻', description: '科幻题材作品', color: '#10B981', icon: '🚀', isPopular: true, count: 0, createdAt: new Date().toISOString() },
  { id: '4', name: '武侠', description: '传统武侠小说', color: '#F59E0B', icon: '⚔️', isPopular: true, count: 0, createdAt: new Date().toISOString() },
  { id: '5', name: '仙侠', description: '仙侠修真小说', color: '#6366F1', icon: '☯️', isPopular: true, count: 0, createdAt: new Date().toISOString() },
  { id: '6', name: '历史', description: '历史题材作品', color: '#EC4899', icon: '📜', isPopular: false, count: 0, createdAt: new Date().toISOString() },
  { id: '7', name: '军事', description: '军事战争题材', color: '#EF4444', icon: '🎖️', isPopular: false, count: 0, createdAt: new Date().toISOString() },
  { id: '8', name: '游戏', description: '网游、电竞题材', color: '#14B8A6', icon: '🎮', isPopular: false, count: 0, createdAt: new Date().toISOString() },
  { id: '9', name: '悬疑', description: '悬疑推理小说', color: '#64748B', icon: '🔍', isPopular: false, count: 0, createdAt: new Date().toISOString() },
  { id: '10', name: '言情', description: '言情情感小说', color: '#F43F5E', icon: '💕', isPopular: false, count: 0, createdAt: new Date().toISOString() },
]

const colors = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
]

const icons = ['⚡', '🏙️', '🚀', '⚔️', '☯️', '📜', '🎖️', '🎮', '🔍', '💕', '🌟', '🎭', '🎪', '🎨', '🎬', '📚', '🎯', '💎', '🔥', '⭐']

export default function GenreManagement() {
  const store = useNovelStore()
  const [genres, setGenres] = useState<Genre[]>(defaultGenres)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'popular'>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: colors[0],
    icon: icons[0],
    isPopular: false,
  })

  useEffect(() => {
    // 从小说统计各类型数量
    const genreCounts = store.novels.reduce((acc, novel) => {
      if (novel.genre) {
        acc[novel.genre] = (acc[novel.genre] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    setGenres(prev => prev.map(genre => ({
      ...genre,
      count: genreCounts[genre.name] || 0
    })))
  }, [store.novels])

  const filteredGenres = genres.filter(genre => {
    const matchesSearch = genre.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         genre.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || (filterType === 'popular' && genre.isPopular)
    return matchesSearch && matchesType
  })

  const handleOpenDialog = (genre?: Genre) => {
    if (genre) {
      setEditingGenre(genre)
      setFormData({
        name: genre.name,
        description: genre.description,
        color: genre.color,
        icon: genre.icon,
        isPopular: genre.isPopular,
      })
    } else {
      setEditingGenre(null)
      setFormData({
        name: '',
        description: '',
        color: colors[0],
        icon: icons[0],
        isPopular: false,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingGenre(null)
  }

  const handleSave = () => {
    if (!formData.name.trim()) return

    if (editingGenre) {
      const updatedGenre: Genre = {
        ...editingGenre,
        name: formData.name,
        description: formData.description,
        color: formData.color,
        icon: formData.icon,
        isPopular: formData.isPopular,
      }
      setGenres(genres.map(g => g.id === editingGenre.id ? updatedGenre : g))
    } else {
      const newGenre: Genre = {
        id: generateId(),
        name: formData.name,
        description: formData.description,
        color: formData.color,
        icon: formData.icon,
        isPopular: formData.isPopular,
        count: 0,
        createdAt: new Date().toISOString(),
      }
      setGenres([...genres, newGenre])
    }

    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个类型吗？')) {
      setGenres(genres.filter(g => g.id !== id))
    }
  }

  const handleTogglePopular = (id: string) => {
    setGenres(genres.map(g => 
      g.id === id ? { ...g, isPopular: !g.isPopular } : g
    ))
  }

  const stats = {
    total: genres.length,
    popular: genres.filter(g => g.isPopular).length,
    totalNovels: store.novels.length,
    activeGenres: genres.filter(g => g.count > 0).length,
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 标题和统计 */}
      <div>
        <h1 className="text-2xl font-bold mb-4">类型管理</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">总类型数</span>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">热门类型</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.popular}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">总小说数</span>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalNovels}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">活跃类型</span>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.activeGenres}</div>
          </Card>
        </div>
      </div>

      {/* 工具栏 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索类型..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={(value: 'all' | 'popular') => setFilterType(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="popular">仅热门</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                新建类型
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingGenre ? '编辑类型' : '新建类型'}</DialogTitle>
                <DialogDescription>
                  {editingGenre ? '修改类型信息' : '创建一个新的小说类型'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="genre-name">类型名称 *</Label>
                  <Input
                    id="genre-name"
                    placeholder="例如：玄幻、都市、科幻..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre-description">描述</Label>
                  <Textarea
                    id="genre-description"
                    placeholder="简短描述这个类型的特点..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>颜色标识</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>图标</Label>
                  <div className="flex gap-2 flex-wrap">
                    {icons.map(icon => (
                      <button
                        key={icon}
                        className={`w-10 h-10 rounded-lg border-2 text-xl transition-all ${
                          formData.icon === icon ? 'border-foreground bg-primary/10 scale-110' : 'border-transparent bg-muted'
                        }`}
                        onClick={() => setFormData({ ...formData, icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-popular"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is-popular">标记为热门类型</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  取消
                </Button>
                <Button onClick={handleSave}>{editingGenre ? '保存' : '创建'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* 类型列表 */}
      <div className="flex-1 overflow-auto">
        {filteredGenres.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <Tag className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg mb-2">暂无类型</p>
            <p className="text-sm">点击上方"新建类型"按钮添加类型</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGenres.map((genre) => (
              <Card key={genre.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  {/* 类型头部 */}
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex items-center gap-2"
                      style={{ color: genre.color }}
                    >
                      <span className="text-2xl">{genre.icon}</span>
                      <h3 className="font-semibold text-lg">{genre.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {genre.isPopular && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          热门
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 描述 */}
                  {genre.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {genre.description}
                    </p>
                  )}

                  {/* 统计 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{genre.count} 部小说</span>
                    </div>
                    <div 
                      className="w-6 h-6 rounded-full border-2"
                      style={{ 
                        backgroundColor: genre.color,
                        borderColor: genre.color 
                      }}
                    />
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleTogglePopular(genre.id)}
                    >
                      {genre.isPopular ? '取消热门' : '设为热门'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(genre)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(genre.id)}
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
