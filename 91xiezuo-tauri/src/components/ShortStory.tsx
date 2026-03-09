import { useState, useEffect } from 'react'
import { useNovelStore } from '@/store/novelStore'
import { generateTextStream } from '@/services/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import {
  FileText,
  Sparkles,
  Download,
  Trash2,
  Copy,
  Eye,
  RefreshCw,
  BookOpen,
  Target,
  Clock,
} from 'lucide-react'
import { generateId, formatDate, countWords } from '@/lib/utils'
import type { ShortStory } from '@/types'

const genres = [
  '科幻', '奇幻', '悬疑', '爱情', '恐怖',
  '历史', '现实', '寓言', '童话', '其他'
]

const lengths = [
  { label: '短篇（500-1000字）', min: 500, max: 1000 },
  { label: '中短篇（1000-2000字）', min: 1000, max: 2000 },
  { label: '中篇（2000-5000字）', min: 2000, max: 5000 },
  { label: '长篇（5000+字）', min: 5000, max: 10000 },
]

const templates = [
  {
    id: '1',
    name: '反转故事',
    description: '包含意外结局的故事',
    prompt: '请写一个包含意外结局的{genre}故事。要求：\n1. 前面铺垫自然\n2. 结尾有意外反转\n3. 合理且令人印象深刻\n4. 字数在{length}字左右\n\n主题：{theme}',
  },
  {
    id: '2',
    name: '微小说',
    description: '精简凝练的微型小说',
    prompt: '请写一个{genre}题材的微小说。要求：\n1. 结构紧凑\n2. 意味深长\n3. 用词精练\n4. 字数在300字以内\n\n主题：{theme}',
  },
  {
    id: '3',
    name: '寓言故事',
    description: '有深刻寓意的寓言',
    prompt: '请写一个{genre}寓言故事。要求：\n1. 有明确的寓意\n2. 形象生动\n3. 适合各年龄段\n4. 字数在{length}字左右\n\n主题：{theme}',
  },
  {
    id: '4',
    name: '科幻小品',
    description: '科幻题材的短篇故事',
    prompt: '请写一个科幻小品。要求：\n1. 有科幻设定\n2. 探讨人性或社会\n3. 想象力丰富\n4. 字数在{length}字左右\n\n主题：{theme}',
  },
]

export default function ShortStory() {
  const store = useNovelStore()
  const [stories, setStories] = useState<ShortStory[]>([])
  const [selectedStory, setSelectedStory] = useState<ShortStory | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  
  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    genre: '科幻',
    length: lengths[1],
    template: templates[0],
    customPrompt: '',
  })

  useEffect(() => {
    // 从 localStorage 加载保存的故事
    const savedStories = localStorage.getItem('shortStories')
    if (savedStories) {
      try {
        setStories(JSON.parse(savedStories))
      } catch (e) {
        console.error('加载短文失败:', e)
      }
    }
  }, [])

  useEffect(() => {
    // 保存故事到 localStorage
    localStorage.setItem('shortStories', JSON.stringify(stories))
  }, [stories])

  const handleGenerate = async () => {
    if (!formData.theme.trim()) {
      alert('请输入故事主题')
      return
    }

    setIsGenerating(true)
    setGeneratedContent('')

    const prompt = formData.template.prompt
      .replace('{genre}', formData.genre)
      .replace('{length}', `${formData.length.min}-${formData.length.max}`)
      .replace('{theme}', formData.theme)

    try {
      let content = ''
      for await (const chunk of generateTextStream(prompt)) {
        content += chunk
        setGeneratedContent(content)
      }

      const wordCount = countWords(content)
      const newStory: ShortStory = {
        id: generateId(),
        title: formData.title || `短文-${stories.length + 1}`,
        content,
        genre: formData.genre,
        wordCount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setStories([newStory, ...stories])
      setSelectedStory(newStory)
      setGeneratedContent('')
      setFormData({ ...formData, title: '', theme: '' })

    } catch (error) {
      console.error('生成短文失败:', error)
      alert('生成短文失败，请检查API配置')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async () => {
    handleGenerate()
  }

  const handleSaveStory = () => {
    if (!generatedContent.trim()) return

    const wordCount = countWords(generatedContent)
    const newStory: ShortStory = {
      id: generateId(),
      title: formData.title || `短文-${stories.length + 1}`,
      content: generatedContent,
      genre: formData.genre,
      wordCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setStories([newStory, ...stories])
    setSelectedStory(newStory)
    setGeneratedContent('')
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这篇短文吗？')) {
      setStories(stories.filter(s => s.id !== id))
      if (selectedStory?.id === id) {
        setSelectedStory(null)
      }
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    alert('内容已复制到剪贴板')
  }

  const handleExport = (story: ShortStory) => {
    const blob = new Blob([story.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${story.title}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const stats = {
    total: stories.length,
    totalWords: stories.reduce((sum, s) => sum + s.wordCount, 0),
    genres: stories.reduce((acc, s) => {
      acc[s.genre] = (acc[s.genre] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold mb-2">短文写作</h1>
        <p className="text-muted-foreground">快速创作各种类型的短篇故事</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">短文总数</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">总字数</span>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">常用类型</span>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {Object.keys(stats.genres).length}
          </div>
        </Card>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* 左侧：创作面板 */}
        <Card className="flex-1 overflow-auto">
          <Tabs defaultValue="create" className="h-full flex flex-col">
            <div className="p-4 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">创作新短文</TabsTrigger>
                <TabsTrigger value="saved">我的短文</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="create" className="flex-1 overflow-auto p-6 space-y-6">
              {/* 基本设置 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="story-title">标题（可选）</Label>
                  <Input
                    id="story-title"
                    placeholder="为短文取个标题"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="story-theme">故事主题 *</Label>
                  <Textarea
                    id="story-theme"
                    placeholder="描述你想写的故事主题、情节或创意..."
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              {/* 创作选项 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="story-genre">类型</Label>
                  <Select 
                    value={formData.genre} 
                    onValueChange={(value) => setFormData({ ...formData, genre: value })}
                  >
                    <SelectTrigger id="story-genre">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="story-length">长度</Label>
                  <Select 
                    value={formData.length.label} 
                    onValueChange={(value) => {
                      const selected = lengths.find(l => l.label === value)
                      if (selected) setFormData({ ...formData, length: selected })
                    }}
                  >
                    <SelectTrigger id="story-length">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lengths.map(len => (
                        <SelectItem key={len.label} value={len.label}>{len.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 模板选择 */}
              <div>
                <Label>创作模板</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {templates.map(template => (
                    <Card
                      key={template.id}
                      className={`p-4 cursor-pointer transition-all ${
                        formData.template.id === template.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setFormData({ ...formData, template })}
                    >
                      <h4 className="font-semibold mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 自定义提示词 */}
              <div>
                <Label htmlFor="custom-prompt">自定义提示词（可选）</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="如果不使用模板，可以在这里输入自定义的创作提示词..."
                  value={formData.customPrompt}
                  onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
                  rows={4}
                />
              </div>

              {/* 生成按钮 */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !formData.theme.trim()}
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? '生成中...' : '生成短文'}
                </Button>
                {generatedContent && (
                  <Button 
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新生成
                  </Button>
                )}
                {generatedContent && (
                  <Button 
                    onClick={handleSaveStory}
                    variant="outline"
                  >
                    保存短文
                  </Button>
                )}
              </div>

              {/* 生成结果 */}
              {generatedContent && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>生成结果</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {countWords(generatedContent)} 字
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(generatedContent)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="flex-1 overflow-auto p-6">
              {stories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileText className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg mb-2">暂无保存的短文</p>
                  <p className="text-sm">创作第一篇短文吧</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stories.map((story) => (
                    <Card 
                      key={story.id} 
                      className={`p-4 cursor-pointer transition-all ${
                        selectedStory?.id === story.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedStory(story)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{story.title}</h4>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {story.genre}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {story.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{story.wordCount} 字</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(story.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExport(story)
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(story.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* 右侧：预览面板 */}
        {selectedStory && (
          <Card className="w-[400px] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">预览</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(selectedStory.content)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleExport(selectedStory)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">{selectedStory.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{selectedStory.genre}</span>
                    <span>{selectedStory.wordCount} 字</span>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  {selectedStory.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 leading-relaxed">
                      {paragraph || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
