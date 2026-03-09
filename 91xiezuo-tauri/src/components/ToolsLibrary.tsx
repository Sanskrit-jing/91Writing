import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface WritingTool {
  id: string
  name: string
  description: string
  category: string
  prompt: string
  createdAt: string
}

const defaultTools: WritingTool[] = [
  {
    id: '1',
    name: '大纲生成器',
    description: '根据关键词生成完整的故事大纲',
    category: '大纲创作',
    prompt: '请根据以下关键词生成一个完整的故事大纲：{keyword}\n\n要求：\n1. 包含完整的故事结构（起因、发展、高潮、结局）\n2. 3-5个主要角色\n3. 10-15章的章节安排\n4. 详细的情节发展',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: '角色塑造工具',
    description: '深度塑造立体化的角色形象',
    category: '角色创作',
    prompt: '请帮我深度塑造一个角色，角色名称：{name}\n\n要求：\n1. 外貌特征（3-5个细节）\n2. 性格特点（核心性格+矛盾点）\n3. 背景故事\n4. 内在动机\n5. 角色弧光',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: '场景描写助手',
    description: '生成生动详细的场景描写',
    category: '场景创作',
    prompt: '请帮我描写一个{场景}的场景\n\n要求：\n1. 5感描写（视觉、听觉、嗅觉、触觉、味觉）\n2. 环境细节\n3. 氛围营造\n4. 情感基调',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: '对话生成器',
    description: '生成自然流畅的对话',
    category: '对话创作',
    prompt: '请生成一段{角色A}和{角色B}的对话\n\n场景：{场景}\n话题：{话题}\n\n要求：\n1. 对话自然，符合角色性格\n2. 有潜台词\n3. 推动情节发展\n4. 包含动作描写',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: '冲突设计工具',
    description: '设计引人入胜的戏剧冲突',
    category: '情节设计',
    prompt: '请帮我设计一个戏剧冲突\n\n类型：{类型}（内冲突/外冲突）\n场景：{场景}\n\n要求：\n1. 明确的冲突双方\n2. 冲突的核心矛盾\n3. 冲突的层次（表面/深层）\n4. 升级过程\n5. 解决方案的可能性',
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: '节奏控制助手',
    description: '帮助控制故事的节奏',
    category: '技巧应用',
    prompt: '请帮我分析这段情节的节奏，并给出调整建议\n\n情节内容：{情节}\n\n要求：\n1. 当前节奏分析（快/慢/适中）\n2. 节奏是否合适\n3. 调整建议（如需）',
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    name: '伏笔埋设工具',
    description: '巧妙地埋设伏笔',
    category: '技巧应用',
    prompt: '请帮我在这个情节中埋设伏笔\n\n当前情节：{情节}\n要暗示的后续发展：{后续}\n\n要求：\n1. 自然融入情节\n2. 不容易被察觉\n3. 后续能合理解释\n4. 多层次暗示',
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    name: '开头创作助手',
    description: '打造引人入胜的故事开头',
    category: '开头结尾',
    prompt: '请帮我创作一个故事开头\n\n类型：{类型}（悬念/场景/对话/心理）\n核心信息：{信息}\n\n要求：\n1. 前500字抓住读者\n2. 建立核心悬念\n3. 引入主角\n4. 设定基调',
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    name: '高潮设计工具',
    description: '设计震撼人心的故事高潮',
    category: '情节设计',
    prompt: '请帮我设计故事高潮\n\n铺垫：{铺垫}\n核心矛盾：{矛盾}\n\n要求：\n1. 多条线索汇聚\n2. 情绪最高点\n3. 关键选择\n4. 戏剧性转折\n5. 意外但合理',
    createdAt: new Date().toISOString()
  },
  {
    id: '10',
    name: '结尾创作助手',
    description: '创作余韵悠长的故事结尾',
    category: '开头结尾',
    prompt: '请帮我创作故事结尾\n\n类型：{类型}（圆满/悲剧/开放/循环）\n前情：{前情}\n\n要求：\n1. 呼应开头\n2. 情绪收束\n3. 主题升华\n4. 留有余韵',
    createdAt: new Date().toISOString()
  }
]

const categories = ['全部', '大纲创作', '角色创作', '场景创作', '对话创作', '情节设计', '技巧应用', '开头结尾']

export default function ToolsLibrary() {
  const [tools, setTools] = useState<WritingTool[]>(defaultTools)
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<WritingTool | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    prompt: ''
  })
  const [inputValues, setInputValues] = useState<Record<string, string>>({})

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === '全部' || tool.category === selectedCategory
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleUseTool = (tool: WritingTool) => {
    setEditingTool(tool)
    setInputValues({})
    setIsDialogOpen(true)
  }

  const handleGenerate = async () => {
    let prompt = editingTool?.prompt || ''
    
    // 替换占位符
    for (const [key, value] of Object.entries(inputValues)) {
      const placeholder = `{${key}}`
      if (prompt.includes(placeholder)) {
        prompt = prompt.replace(new RegExp(placeholder, 'g'), value)
      }
    }

    // 调用 API 生成内容
    console.log('生成提示词:', prompt)
    // TODO: 实际调用 API
    setIsDialogOpen(false)
  }

  const handleAddTool = () => {
    const newTool: WritingTool = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      prompt: formData.prompt,
      createdAt: new Date().toISOString()
    }
    setTools([...tools, newTool])
    setFormData({ name: '', description: '', category: '', prompt: '' })
  }

  const handleEditTool = (tool: WritingTool) => {
    setFormData({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      prompt: tool.prompt
    })
    setEditingTool(tool)
    setIsDialogOpen(true)
  }

  const handleDeleteTool = (id: string) => {
    setTools(tools.filter(tool => tool.id !== id))
  }

  const getPlaceholders = (prompt: string): string[] => {
    const matches = prompt.match(/\{([^}]+)\}/g)
    return matches ? matches.map(m => m.slice(1, -1)) : []
  }

  return (
    <div className="h-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">工具库</h1>
        <Dialog open={isDialogOpen && !editingTool} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setFormData({ name: '', description: '', category: '', prompt: '' })
              setEditingTool(null)
            }}>
              新建工具
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新建工具</DialogTitle>
              <DialogDescription>创建一个新的写作工具</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tool-name">工具名称</Label>
                <Input
                  id="tool-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：大纲生成器"
                />
              </div>
              <div>
                <Label htmlFor="tool-description">描述</Label>
                <Input
                  id="tool-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="简短描述工具功能"
                />
              </div>
              <div>
                <Label htmlFor="tool-category">分类</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="tool-category">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tool-prompt">提示词模板</Label>
                <Textarea
                  id="tool-prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="使用 {占位符} 标记可替换的内容，例如：{keyword}"
                  rows={6}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  使用 {"{占位符}"} 标记可替换的内容
                </p>
              </div>
              <Button onClick={handleAddTool} className="w-full">创建工具</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 space-y-4">
        <Input
          placeholder="搜索工具..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="text-sm">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map(tool => (
          <Card key={tool.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{tool.name}</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {tool.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleUseTool(tool)}
                >
                  使用
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleEditTool(tool)}
                >
                  编辑
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleDeleteTool(tool.id)}
                >
                  删除
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 使用工具对话框 */}
      <Dialog open={isDialogOpen && !!editingTool} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTool?.name}</DialogTitle>
            <DialogDescription>{editingTool?.description}</DialogDescription>
          </DialogHeader>
          {editingTool && (
            <div className="space-y-4">
              {getPlaceholders(editingTool.prompt).map(placeholder => (
                <div key={placeholder}>
                  <Label htmlFor={placeholder}>{placeholder}</Label>
                  <Input
                    id={placeholder}
                    value={inputValues[placeholder] || ''}
                    onChange={(e) => setInputValues({ ...inputValues, [placeholder]: e.target.value })}
                    placeholder={`请输入${placeholder}`}
                  />
                </div>
              ))}
              <Button onClick={handleGenerate} className="w-full">生成内容</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
