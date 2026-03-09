import { useState } from 'react'
import { useNovelStore } from '@/store/novelStore'
import { generateOutlineStream, generateChapterContentStream } from '@/services/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  BookOpen,
  MessageSquare,
  Zap,
  Download,
  Settings,
  FileText,
  Target,
  Database,
  RotateCcw,
  Bell,
} from 'lucide-react'

export default function HomePage() {
  const store = useNovelStore()
  const [keywords, setKeywords] = useState(store.keywords)
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateOutline = async () => {
    if (!keywords.trim()) return

    setIsGenerating(true)
    store.setKeywords(keywords)
    setGeneratedContent('')

    try {
      let content = ''
      for await (const chunk of generateOutlineStream(keywords)) {
        content += chunk
        setGeneratedContent(content)
      }
      store.setOutline(content)
    } catch (error) {
      console.error('生成大纲失败:', error)
      alert('生成大纲失败，请检查API配置')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateChapter = async () => {
    if (!store.outline) {
      alert('请先生成大纲')
      return
    }

    setIsGenerating(true)
    setGeneratedContent('')

    try {
      let content = ''
      for await (const chunk of generateChapterContentStream(
        '第一章',
        store.outline
      )) {
        content += chunk
        setGeneratedContent(content)
        setGeneratedContent(content)
      }
      store.addToNovel(content)
    } catch (error) {
      console.error('生成章节失败:', error)
      alert('生成章节失败，请检查API配置')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExport = () => {
    const content = store.currentNovel + generatedContent
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `小说-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI写作工作台</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            文章统计
          </Button>
          <Button variant="outline" size="sm">
            <Database className="mr-2 h-4 w-4" />
            语料库
          </Button>
          <Button variant="outline" size="sm">
            <Target className="mr-2 h-4 w-4" />
            写作目标
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            备份管理
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            API配置
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            公告
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* 左侧配置面板 */}
        <Card className="p-6 overflow-auto">
          <h2 className="text-lg font-semibold mb-4">创作设置</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">关键词</label>
              <Textarea
                placeholder="请输入小说关键词，如：修仙、仙侠、主角、金手指..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">生成选项</label>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-muted-foreground">字数目标</label>
                  <Input type="number" placeholder="2000" defaultValue={2000} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">创作风格</label>
                  <Input placeholder="如：生动形象，情节紧凑" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleGenerateOutline}
                disabled={isGenerating || !keywords.trim()}
                className="w-full"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                生成大纲
              </Button>
              <Button
                onClick={handleGenerateChapter}
                disabled={isGenerating || !store.outline}
                variant="outline"
                className="w-full"
              >
                <Zap className="mr-2 h-4 w-4" />
                生成章节
              </Button>
            </div>
          </div>
        </Card>

        {/* 中间编辑区 */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">编辑器</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>字数: {store.currentNovel.length + generatedContent.length}</span>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                导出
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <Textarea
              value={store.currentNovel + generatedContent}
              onChange={(e) => store.setCurrentNovel(e.target.value)}
              placeholder="在这里编辑您的小说内容..."
              className="h-full min-h-[500px] resize-none border-0 focus:ring-0 p-0 text-base leading-relaxed"
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
