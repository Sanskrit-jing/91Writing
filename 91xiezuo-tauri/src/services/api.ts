import axios from 'axios'
import type {
  ApiConfig,
  ChatMessage,
  BillingRecord,
  ModelConfig,
  GenerationOptions,
  Character,
  WorldSetting,
} from '@/types'
import { useNovelStore } from '@/store/novelStore'
import { generateId } from '@/lib/utils'

// 官方API配置
const OFFICIAL_API_BASE_URL = 'https://ai.91hub.vip/v1'

// 官方模型列表
export const OFFICIAL_MODELS: ModelConfig[] = [
  {
    id: 'claude-4-sonnet',
    name: 'Claude-4 Sonnet',
    type: 'official',
    price: 0.1,
    maxTokens: 4096,
  },
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    type: 'official',
    price: 0.5,
    maxTokens: 8192,
  },
  {
    id: 'claude-3-7-sonnet-thinking',
    name: 'Claude-3.7 Sonnet Thinking',
    type: 'official',
    price: 0.2,
    maxTokens: 4096,
  },
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude-3.7 Sonnet',
    type: 'official',
    price: 0.1,
    maxTokens: 4096,
  },
]

// 默认自定义模型列表
export const DEFAULT_CUSTOM_MODELS: ModelConfig[] = [
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek R1',
    type: 'custom',
    maxTokens: 64000,
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V3',
    type: 'custom',
    maxTokens: 64000,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    type: 'custom',
    maxTokens: 128000,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    type: 'custom',
    maxTokens: 128000,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    type: 'custom',
    maxTokens: 4096,
  },
]

// API请求客户端
class ApiClient {
  private config: ApiConfig | null = null

  setConfig(config: ApiConfig) {
    this.config = config
  }

  getConfig(): ApiConfig | null {
    return this.config
  }

  private getBaseUrl(): string {
    return this.config?.baseUrl || OFFICIAL_API_BASE_URL
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config?.apiKey || ''}`,
    }
  }

  // 验证API密钥
  async validateApiKey(apiKey: string, baseUrl: string): Promise<boolean> {
    try {
      const response = await axios.get(`${baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
      return response.status === 200
    } catch (error) {
      console.error('API key validation failed:', error)
      return false
    }
  }

  // 通用API请求
  async makeRequest(
    endpoint: string,
    data: any,
    stream: boolean = false
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}${endpoint}`,
        data,
        {
          headers: this.getHeaders(),
          responseType: stream ? 'stream' : 'json',
        }
      )
      return response.data
    } catch (error: any) {
      console.error('API request failed:', error)
      throw new Error(error.response?.data?.error?.message || error.message)
    }
  }

  // 流式生成
  async *makeStreamRequest(endpoint: string, data: any): AsyncGenerator<string> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}${endpoint}`,
        data,
        {
          headers: this.getHeaders(),
          responseType: 'stream',
        }
      )

      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                yield content
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Stream request failed:', error)
      throw new Error(error.response?.data?.error?.message || error.message)
    }
  }

  // 生成文本
  async generateText(
    prompt: string,
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<string> {
    const store = useNovelStore()
    const config = store.currentApiConfig
    if (!config) {
      throw new Error('API not configured')
    }

    const data = {
      model: options?.model || config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? config.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? config.maxTokens ?? 2000,
    }

    const response = await this.makeRequest('/chat/completions', data)
    const content = response.choices?.[0]?.message?.content || ''

    // 记录计费
    this.recordBilling(
      config.model,
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0
    )

    return content
  }

  // 流式生成文本
  async *generateTextStream(
    prompt: string,
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    },
    onProgress?: (content: string) => void
  ): AsyncGenerator<string> {
    const store = useNovelStore()
    const config = store.currentApiConfig
    if (!config) {
      throw new Error('API not configured')
    }

    const data = {
      model: options?.model || config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? config.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? config.maxTokens ?? 2000,
      stream: true,
    }

    let fullContent = ''
    for await (const chunk of this.makeStreamRequest('/chat/completions', data)) {
      fullContent += chunk
      onProgress?.(chunk)
      yield chunk
    }

    // 估算token并记录计费
    const inputTokens = Math.ceil(prompt.length / 4)
    const outputTokens = Math.ceil(fullContent.length / 4)
    this.recordBilling(config.model, inputTokens, outputTokens)
  }

  // 生成大纲
  async generateOutline(
    keywords: string,
    options?: {
      chapterCount?: number
      genre?: string
    }
  ): Promise<string> {
    const prompt = this.buildOutlinePrompt(keywords, options)
    return await this.generateText(prompt, { maxTokens: 2000 })
  }

  // 流式生成大纲
  async *generateOutlineStream(
    keywords: string,
    options?: {
      chapterCount?: number
      genre?: string
    },
    onProgress?: (content: string) => void
  ): AsyncGenerator<string> {
    const prompt = this.buildOutlinePrompt(keywords, options)
    yield* this.generateTextStream(prompt, { maxTokens: 2000 }, onProgress)
  }

  private buildOutlinePrompt(
    keywords: string,
    options?: {
      chapterCount?: number
      genre?: string
    }
  ): string {
    const chapterCount = options?.chapterCount || 8
    const genre = options?.genre || '小说'

    return `请根据以下关键词，为一部${genre}创建详细的大纲：

关键词：${keywords}

要求：
1. 创建${chapterCount}个章节的大纲
2. 每个章节要有明确的主要情节和冲突
3. 故事要有起承转合，有完整的结构
4. 大纲要具体详细，包含主要人物和关键事件
5. 确保故事逻辑连贯，情节合理

请以清晰的格式输出大纲，每个章节单独列出。`
  }

  // 生成章节内容
  async generateChapterContent(
    chapterTitle: string,
    outline: string,
    previousChapters?: string,
    options?: {
      wordCount?: number
      style?: string
    }
  ): Promise<string> {
    const prompt = this.buildChapterPrompt(
      chapterTitle,
      outline,
      previousChapters,
      options
    )
    return await this.generateText(prompt, { maxTokens: 4000 })
  }

  // 流式生成章节内容
  async *generateChapterContentStream(
    chapterTitle: string,
    outline: string,
    previousChapters?: string,
    options?: {
      wordCount?: number
      style?: string
    },
    onProgress?: (content: string) => void
  ): AsyncGenerator<string> {
    const prompt = this.buildChapterPrompt(
      chapterTitle,
      outline,
      previousChapters,
      options
    )
    yield* this.generateTextStream(prompt, { maxTokens: 4000 }, onProgress)
  }

  private buildChapterPrompt(
    chapterTitle: string,
    outline: string,
    previousChapters?: string,
    options?: {
      wordCount?: number
      style?: string
    }
  ): string {
    const wordCount = options?.wordCount || 2000
    const style = options?.style || '生动形象，情节紧凑'

    let prompt = `请根据以下信息，创作一章小说内容：

章节标题：${chapterTitle}

小说大纲：
${outline}
`

    if (previousChapters) {
      prompt += `\n前文内容摘要：\n${previousChapters}\n`
    }

    prompt += `

要求：
1. 字数控制在${wordCount}字左右
2. 文风：${style}
3. 与大纲保持一致
4. 人物形象丰满，对话自然
5. 情节流畅，节奏恰当
6. 适当使用环境描写和心理描写

请直接输出章节内容，不要有额外的解释。`

    return prompt
  }

  // AI对话
  async chatWithAI(
    messages: ChatMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
    }
  ): Promise<string> {
    const store = useNovelStore()
    const config = store.currentApiConfig
    if (!config) {
      throw new Error('API not configured')
    }

    const data = {
      model: config.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature ?? config.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? config.maxTokens ?? 2000,
    }

    const response = await this.makeRequest('/chat/completions', data)
    const content = response.choices?.[0]?.message?.content || ''

    // 记录计费
    this.recordBilling(
      config.model,
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0
    )

    return content
  }

  // 生成摘要
  async generateSummary(
    text: string,
    options?: {
      length?: 'short' | 'medium' | 'long'
      type?: 'points' | 'plot' | 'characters' | 'theme'
    }
  ): Promise<string> {
    const length = options?.length || 'medium'
    const type = options?.type || 'points'

    const prompt = `请对以下文本生成${length === 'short' ? '简短' : length === 'long' ? '详细' : '中等'}长度的${type === 'points' ? '要点摘要' : type === 'plot' ? '情节摘要' : type === 'characters' ? '人物摘要' : '主题摘要'}：

文本：
${text}

请直接输出摘要内容。`

    return await this.generateText(prompt, { maxTokens: 1000 })
  }

  // 获取写作建议
  async getWritingAdvice(text: string): Promise<string> {
    const prompt = `请对以下文本内容提供专业的写作建议，包括改进意见、亮点和可以提升的地方：

文本：
${text}

请从以下几个方面提供建议：
1. 情节结构和节奏
2. 人物塑造和对话
3. 语言表达和描写
4. 整体评价和改进方向

请以清晰、有条理的方式输出建议。`

    return await this.generateText(prompt, { maxTokens: 1500 })
  }

  // 个性化内容生成
  async generatePersonalizedContent(
    prompt: string,
    corpusData: string[],
    options?: {
      temperature?: number
      maxTokens?: number
    }
  ): Promise<string> {
    const corpusContext = corpusData.join('\n\n---\n\n')

    const fullPrompt = `以下是已有的文本语料，作为参考风格和内容：

${corpusContext}

---

现在请基于以上语料的风格和特点，创作新的内容：

${prompt}

请保持与语料相似的写作风格、人物设定和世界观设定。`

    return await this.generateText(fullPrompt, options)
  }

  // 生成人物设定
  async generateCharacter(description: string): Promise<string> {
    const prompt = `请根据以下描述，创建一个详细的人物设定：

描述：${description}

请包含以下信息：
1. 基本信息（姓名、年龄、性别）
2. 外貌特征
3. 性格特点
4. 背景故事
5. 特殊技能或能力
6. 人际关系

请以结构化的方式输出人物设定。`

    return await this.generateText(prompt, { maxTokens: 1000 })
  }

  // 生成世界观设定
  async generateWorldSetting(description: string): Promise<string> {
    const prompt = `请根据以下描述，创建一个详细的世界观设定：

描述：${description}

请包含以下信息：
1. 世界名称和类型
2. 地理环境
3. 历史背景
4. 社会规则和法则
5. 特殊设定（如魔法、科技等）
6. 主要势力或组织

请以结构化的方式输出世界观设定。`

    return await this.generateText(prompt, { maxTokens: 1500 })
  }

  // 文章分析
  async analyzeArticle(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative'
    tags: string[]
    category: string
    score: number
  }> {
    const prompt = `请分析以下文本的情感倾向、标签、分类和评分（0-100分）：

文本：
${text}

请以JSON格式输出分析结果：
{
  "sentiment": "positive/neutral/negative",
  "tags": ["标签1", "标签2"],
  "category": "分类",
  "score": 评分
}`

    const response = await this.generateText(prompt, { temperature: 0.3 })
    try {
      const parsed = JSON.parse(response)
      return parsed
    } catch {
      return {
        sentiment: 'neutral',
        tags: [],
        category: '未分类',
        score: 50,
      }
    }
  }

  // 记录计费
  private recordBilling(
    model: string,
    inputTokens: number,
    outputTokens: number
  ) {
    const store = useNovelStore()
    const config = store.currentApiConfig
    if (!config) return

    let cost = 0
    if (config.type === 'official') {
      const modelConfig = OFFICIAL_MODELS.find((m) => m.id === model)
      cost = modelConfig?.price || 0.1
    } else {
      // 自定义API按token计费，这里使用示例价格
      cost = (inputTokens + outputTokens) * 0.0001
    }

    const record: BillingRecord = {
      id: generateId(),
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost,
      status: 'success',
      timestamp: new Date().toISOString(),
    }

    store.addBillingRecord(record)
  }
}

// 创建单例
export const apiClient = new ApiClient()

// 导出便捷函数
export const validateApiKey = apiClient.validateApiKey.bind(apiClient)
export const generateText = apiClient.generateText.bind(apiClient)
export const generateTextStream = apiClient.generateTextStream.bind(apiClient)
export const generateOutline = apiClient.generateOutline.bind(apiClient)
export const generateOutlineStream = apiClient.generateOutlineStream.bind(apiClient)
export const generateChapterContent = apiClient.generateChapterContent.bind(apiClient)
export const generateChapterContentStream = apiClient.generateChapterContentStream.bind(
  apiClient
)
export const chatWithAI = apiClient.chatWithAI.bind(apiClient)
export const generateSummary = apiClient.generateSummary.bind(apiClient)
export const getWritingAdvice = apiClient.getWritingAdvice.bind(apiClient)
export const generatePersonalizedContent = apiClient.generatePersonalizedContent.bind(
  apiClient
)
export const generateCharacter = apiClient.generateCharacter.bind(apiClient)
export const generateWorldSetting = apiClient.generateWorldSetting.bind(apiClient)
export const analyzeArticle = apiClient.analyzeArticle.bind(apiClient)
