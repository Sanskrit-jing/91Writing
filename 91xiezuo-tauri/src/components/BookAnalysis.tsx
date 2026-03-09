import { useState } from 'react'
import { generateTextStream } from '@/services/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import {
  BookOpen,
  Sparkles,
  Download,
  Trash2,
  Copy,
  Layers,
  Tag,
  Users,
  PenTool,
  Target,
  Brain,
  FileText,
} from 'lucide-react'
import { generateId } from '@/lib/utils'
import type { BookAnalysis } from '@/types'

const analysisTypes = [
  {
    id: 'structure',
    name: '结构分析',
    icon: Layers,
    prompt: `请分析这本书《{bookTitle}》的结构。请提供：
1. 全书结构框架
2. 章节划分逻辑
3. 主要情节发展脉络
4. 高潮和转折点
5. 整体结构的优缺点分析`,
  },
  {
    id: 'themes',
    name: '主题分析',
    icon: Tag,
    prompt: `请分析这本书《{bookTitle}》的主题。请提供：
1. 核心主题是什么
2. 主题的呈现方式
3. 主题的深层含义
4. 主题的现实意义
5. 相关的次要主题`,
  },
  {
    id: 'characters',
    name: '人物分析',
    icon: Users,
    prompt: `请分析这本书《{bookTitle}》的人物。请提供：
1. 主要人物介绍
2. 人物关系图谱
3. 人物性格特点
4. 人物成长弧光
5. 人物设计的亮点`,
  },
  {
    id: 'writing',
    name: '写作技巧',
    icon: PenTool,
    prompt: `请分析这本书《{bookTitle}》的写作技巧。请提供：
1. 叙事手法和视角
2. 语言风格特色
3. 结构布局技巧
4. 情节设计技巧
5. 可以学习的写作方法`,
  },
  {
    id: 'summary',
    name: '内容摘要',
    icon: FileText,
    prompt: `请为这本书《{bookTitle}》提供摘要：
1. 全书内容简介
2. 主要情节概括
3. 关键信息提取
4. 核心观点总结
5. 阅读价值评估`,
  },
  {
    id: 'ideas',
    name: '创意提取',
    icon: Brain,
    prompt: `请从这本书《{bookTitle}》中提取可以借鉴的创意：
1. 世界观设定创意
2. 情节构思创意
3. 人物设定创意
4. 主题表达创意
5. 可以应用到其他作品中的元素`,
  },
]

const detailLevels = [
  { id: 'brief', name: '简要', description: '快速了解要点' },
  { id: 'medium', name: '中等', description: '平衡详细度' },
  { id: 'detailed', name: '详细', description: '深入全面分析' },
]

export default function BookAnalysis() {
  const [analyses, setAnalyses] = useState<BookAnalysis[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<BookAnalysis | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  
  // 表单状态
  const [formData, setFormData] = useState({
    bookTitle: '',
    author: '',
    analysisType: analysisTypes[0],
    detailLevel: detailLevels[1],
    customPrompt: '',
    bookContent: '',
  })

  const handleGenerate = async () => {
    if (!formData.bookTitle.trim()) {
      alert('请输入书名')
      return
    }

    setIsGenerating(true)
    setGeneratedContent('')

    let prompt = formData.analysisType.prompt.replace('{bookTitle}', formData.bookTitle)
    
    if (formData.author) {
      prompt = prompt.replace('《', `（作者：${formData.author}）《`)
    }

    if (formData.detailLevel.id === 'brief') {
      prompt += '\n\n请保持分析简明扼要，每点不超过100字。'
    } else if (formData.detailLevel.id === 'detailed') {
      prompt += '\n\n请提供尽可能详细的分析，包括具体例子和深度解读。'
    }

    if (formData.bookContent) {
      prompt += `\n\n书籍内容参考：\n${formData.bookContent}`
    }

    if (formData.customPrompt) {
      prompt += `\n\n额外要求：\n${formData.customPrompt}`
    }

    try {
      let content = ''
      for await (const chunk of generateTextStream(prompt)) {
        content += chunk
        setGeneratedContent(content)
      }

      const newAnalysis: BookAnalysis = {
        id: generateId(),
        title: formData.bookTitle,
        author: formData.author,
        summary: '',
        structure: '',
        themes: [],
        characters: [],
        writingStyle: content,
        createdAt: new Date().toISOString(),
      }

      // 根据分析类型设置不同字段
      switch (formData.analysisType.id) {
        case 'structure':
          newAnalysis.structure = content
          break
        case 'themes':
          newAnalysis.themes = [content]
          break
        case 'characters':
          newAnalysis.characters = [content]
          break
        case 'writing':
          newAnalysis.writingStyle = content
          break
        case 'summary':
          newAnalysis.summary = content
          break
        case 'ideas':
          newAnalysis.summary = content
          break
      }

      setAnalyses([newAnalysis, ...analyses])
      setSelectedAnalysis(newAnalysis)
      setGeneratedContent('')

    } catch (error) {
      console.error('分析失败:', error)
      alert('分析失败，请检查API配置')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveAnalysis = () => {
    if (!generatedContent.trim()) return

    const newAnalysis: BookAnalysis = {
      id: generateId(),
      title: formData.bookTitle,
      author: formData.author,
      summary: '',
      structure: '',
      themes: [],
      characters: [],
      writingStyle: generatedContent,
      createdAt: new Date().toISOString(),
    }

    setAnalyses([newAnalysis, ...analyses])
    setSelectedAnalysis(newAnalysis)
    setGeneratedContent('')
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个分析吗？')) {
      setAnalyses(analyses.filter(a => a.id !== id))
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null)
      }
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    alert('内容已复制到剪贴板')
  }

  const handleExport = (analysis: BookAnalysis) => {
    const content = `《${analysis.title}》${analysis.author ? `（${analysis.author}）` : ''}\n\n拆书分析\n\n${analysis.writingStyle}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `拆书-${analysis.title}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const stats = {
    total: analyses.length,
    types: analysisTypes.map(type => ({
      ...type,
      count: analyses.filter(a => 
        type.id === 'structure' && a.structure ||
        type.id === 'themes' && a.themes.length ||
        type.id === 'characters' && a.characters.length ||
        type.id === 'writing' && a.writingStyle ||
        type.id === 'summary' && a.summary ||
        type.id === 'ideas' && a.summary
      ).length,
    })),
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold mb-2">拆书工具</h1>
        <p className="text-muted-foreground">深度分析书籍结构、主题和写作技巧</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-muted-foreground">总分析数</div>
        </Card>
        {stats.types.map(type => {
          const Icon = type.icon
          return (
            <Card key={type.id} className="p-4">
              <div className="text-2xl font-bold">{type.count}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {type.name}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* 左侧：分析面板 */}
        <Card className="flex-1 overflow-auto">
          <Tabs defaultValue="analyze" className="h-full flex flex-col">
            <div className="p-4 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analyze">新建分析</TabsTrigger>
                <TabsTrigger value="saved">我的分析</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="analyze" className="flex-1 overflow-auto p-6 space-y-6">
              {/* 书籍信息 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="book-title">书名 *</Label>
                  <Input
                    id="book-title"
                    placeholder="请输入书名"
                    value={formData.bookTitle}
                    onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="book-author">作者（可选）</Label>
                  <Input
                    id="book-author"
                    placeholder="请输入作者"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
              </div>

              {/* 分析类型 */}
              <div>
                <Label>分析类型</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {analysisTypes.map(type => {
                    const Icon = type.icon
                    return (
                      <Card
                        key={type.id}
                        className={`p-4 cursor-pointer transition-all ${
                          formData.analysisType.id === type.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setFormData({ ...formData, analysisType: type })}
                      >
                        <Icon className="h-5 w-5 mb-2 text-primary" />
                        <h4 className="font-semibold mb-1">{type.name}</h4>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* 详细程度 */}
              <div>
                <Label>分析详细程度</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {detailLevels.map(level => (
                    <Card
                      key={level.id}
                      className={`p-4 cursor-pointer transition-all ${
                        formData.detailLevel.id === level.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setFormData({ ...formData, detailLevel: level })}
                    >
                      <h4 className="font-semibold mb-1">{level.name}</h4>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 书籍内容 */}
              <div>
                <Label htmlFor="book-content">书籍内容（可选）</Label>
                <Textarea
                  id="book-content"
                  placeholder="粘贴书籍的部分内容，可以获得更准确的分析..."
                  value={formData.bookContent}
                  onChange={(e) => setFormData({ ...formData, bookContent: e.target.value })}
                  rows={5}
                />
              </div>

              {/* 自定义要求 */}
              <div>
                <Label htmlFor="custom-prompt">自定义要求（可选）</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="添加你希望分析的重点或特殊要求..."
                  value={formData.customPrompt}
                  onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
                  rows={3}
                />
              </div>

              {/* 生成按钮 */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !formData.bookTitle.trim()}
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? '分析中...' : '开始分析'}
                </Button>
                {generatedContent && (
                  <Button 
                    onClick={handleSaveAnalysis}
                    variant="outline"
                  >
                    保存分析
                  </Button>
                )}
              </div>

              {/* 生成结果 */}
              {generatedContent && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>分析结果</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(generatedContent)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
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
              {analyses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <BookOpen className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg mb-2">暂无保存的分析</p>
                  <p className="text-sm">开始拆书分析吧</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyses.map((analysis) => (
                    <Card 
                      key={analysis.id} 
                      className={`p-4 cursor-pointer transition-all ${
                        selectedAnalysis?.id === analysis.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedAnalysis(analysis)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">《{analysis.title}》</h4>
                            {analysis.author && (
                              <span className="text-sm text-muted-foreground">
                                {analysis.author}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {analysis.writingStyle}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopy(analysis.writingStyle)
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExport(analysis)
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(analysis.id)
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
        {selectedAnalysis && (
          <Card className="w-[450px] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">分析详情</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(selectedAnalysis.writingStyle)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleExport(selectedAnalysis)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    《{selectedAnalysis.title}》
                  </h2>
                  {selectedAnalysis.author && (
                    <p className="text-sm text-muted-foreground">
                      作者：{selectedAnalysis.author}
                    </p>
                  )}
                </div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {selectedAnalysis.writingStyle}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
