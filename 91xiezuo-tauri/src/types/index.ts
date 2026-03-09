// 小说相关类型
export interface Novel {
  id: string
  title: string
  author?: string
  description?: string
  cover?: string
  genre?: string
  status: 'draft' | 'in_progress' | 'completed' | 'paused'
  wordCount: number
  createdAt: string
  updatedAt: string
  chapters?: Chapter[]
}

export interface Chapter {
  id: string
  novelId: string
  title: string
  content: string
  order: number
  status: 'draft' | 'in_progress' | 'completed'
  wordCount: number
  createdAt: string
  updatedAt: string
  isGenerated?: boolean
}

// API配置类型
export type ConfigType = 'official' | 'custom'

export interface ApiConfig {
  apiKey: string
  baseUrl: string
  model: string
  temperature?: number
  maxTokens?: number
}

export interface OfficialApiConfig extends ApiConfig {
  type: 'official'
  baseUrl: 'https://ai.91hub.vip/v1'
}

export interface CustomApiConfig extends ApiConfig {
  type: 'custom'
  baseUrl: string
}

// 模型配置
export interface ModelConfig {
  id: string
  name: string
  type: ConfigType
  price?: number
  maxTokens?: number
}

// AI生成相关
export interface GenerationOptions {
  keywords?: string
  template?: string
  wordCount?: number
  style?: string
  audience?: string
  temperature?: number
  maxTokens?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

// 人物设定
export interface Character {
  id: string
  name: string
  age?: number
  gender?: string
  appearance?: string
  personality?: string
  background?: string
  abilities?: string[]
  relationships?: string[]
  createdAt: string
}

// 世界观设定
export interface WorldSetting {
  id: string
  name: string
  description: string
  geography?: string
  history?: string
  rules?: string[]
  createdAt: string
}

// 提示词
export interface Prompt {
  id: string
  name: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// 模板
export interface Template {
  id: string
  name: string
  style: string
  audience: string
  keywords: string[]
  prompt: string
  createdAt: string
  updatedAt: string
}

// 语料
export interface Corpus {
  id: string
  title: string
  content: string
  category?: string
  createdAt: string
  updatedAt: string
}

// 写作目标
export interface WritingGoal {
  id: string
  title: string
  targetWords: number
  currentWords: number
  period: 'daily' | 'weekly' | 'monthly'
  startDate: string
  endDate?: string
  streakDays: number
  createdAt: string
}

// 统计数据
export interface ArticleStats {
  wordCount: number
  readingTime: number
  sentiment?: 'positive' | 'neutral' | 'negative'
  tags?: string[]
  category?: string
  score?: number
}

// 计费记录
export interface BillingRecord {
  id: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  status: 'success' | 'failed'
  timestamp: string
  error?: string
}

export interface UsageStats {
  totalTokens: number
  totalCost: number
  todayTokens: number
  todayCost: number
  callCount: number
}

// 短文
export interface ShortStory {
  id: string
  title: string
  content: string
  genre?: string
  wordCount: number
  createdAt: string
  updatedAt: string
}

// 拆书分析
export interface BookAnalysis {
  id: string
  title: string
  author?: string
  summary: string
  structure: string
  themes: string[]
  characters: string[]
  writingStyle: string
  createdAt: string
}

// 公告
export interface Announcement {
  id: string
  title: string
  content: string
  date: string
  priority: 'low' | 'medium' | 'high'
}

// 备份
export interface Backup {
  id: string
  name: string
  data: any
  createdAt: string
  size: number
}

// 工具结果
export interface ToolResult {
  tool: string
  input: any
  output: string
  timestamp: string
}
