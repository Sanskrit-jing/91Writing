import { create } from 'pinia'
import type {
  Novel,
  Chapter,
  ApiConfig,
  OfficialApiConfig,
  CustomApiConfig,
  ConfigType,
  ChatMessage,
  Character,
  WorldSetting,
  Template,
  Corpus,
  WritingGoal,
  ArticleStats,
  BillingRecord,
  UsageStats,
  Prompt,
  ShortStory,
  BookAnalysis,
  Backup,
  ToolResult,
} from '@/types'
import { generateId, calculateReadingTime } from '@/lib/utils'
import * as dbService from '@/lib/dbService'

interface NovelState {
  // 小说相关
  currentNovel: string
  generatedContent: string
  outline: string
  chapters: Chapter[]
  selectedChapter: Chapter | null
  novels: Novel[]

  // 生成状态
  isGeneratingOutline: boolean
  isGeneratingChapter: boolean
  isGenerating: boolean

  // AI对话
  aiChatHistory: ChatMessage[]
  currentChatInput: string
  isAiChatting: boolean

  // 模板和关键词
  templates: Template[]
  selectedTemplate: Template | null
  keywords: string

  // 写作工具数据
  characters: Character[]
  worldSettings: WorldSetting[]
  corpus: Corpus[]
  prompts: Prompt[]

  // 文章统计
  articleStats: ArticleStats | null
  articleSummary: string
  writingAdvice: string

  // API配置
  officialApiConfig: OfficialApiConfig | null
  customApiConfig: CustomApiConfig | null
  currentConfigType: ConfigType
  isApiConfigured: boolean

  // 计费数据
  billingRecords: BillingRecord[]
  usageStats: UsageStats

  // 写作目标
  writingGoals: WritingGoal[]

  // 短文
  shortStories: ShortStory[]

  // 拆书
  bookAnalyses: BookAnalysis[]

  // 备份
  backups: Backup[]

  // 工具结果
  toolResults: ToolResult[]

  // UI状态
  sidebarCollapsed: boolean
  darkMode: boolean

  // 数据库初始化状态
  dbInitialized: boolean
}

export const useDbStore = create<NovelState>((set, get) => ({
  // 初始状态 - 从数据库加载
  currentNovel: '',
  generatedContent: '',
  outline: '',
  chapters: [],
  selectedChapter: null,
  novels: [],

  isGeneratingOutline: false,
  isGeneratingChapter: false,
  isGenerating: false,

  aiChatHistory: [],
  currentChatInput: '',
  isAiChatting: false,

  templates: [],
  selectedTemplate: null,
  keywords: '',

  characters: [],
  worldSettings: [],
  corpus: [],
  prompts: [],

  articleStats: null,
  articleSummary: '',
  writingAdvice: '',

  officialApiConfig: null,
  customApiConfig: null,
  currentConfigType: 'official',
  isApiConfigured: false,

  billingRecords: [],
  usageStats: {
    totalTokens: 0,
    totalCost: 0,
    todayTokens: 0,
    todayCost: 0,
    callCount: 0,
  },

  writingGoals: [],
  shortStories: [],
  bookAnalyses: [],

  backups: [],
  toolResults: [],

  sidebarCollapsed: false,
  darkMode: false,

  dbInitialized: false,

  // 初始化数据库
  initDb: async () => {
    const { dbInitialized } = get()
    if (dbInitialized) return

    try {
      await dbService.initDatabase()
      
      // 加载小说数据
      const novels = await dbService.getAllNovels()
      set({ novels, dbInitialized: true })

      // 加载提示词
      const prompts = await dbService.getAllPrompts()
      set({ prompts })

      // 加载写作目标
      const goals = await dbService.getAllWritingGoals()
      set({ writingGoals: goals })

      // 加载短文
      const stories = await dbService.getAllShortStories()
      set({ shortStories: stories })

      // 加载拆书分析
      const analyses = await dbService.getAllBookAnalyses()
      set({ bookAnalyses: analyses })

      // 加载计费记录
      const records = await dbService.getBillingRecords()
      set({ billingRecords: records })

    } catch (error) {
      console.error('Failed to initialize database:', error)
    }
  },

  // 小说相关操作
  setNovels: (novels) => set({ novels }),
  
  addNovel: async (novel) => {
    const newNovel = await dbService.createNovel(novel)
    set((state) => ({ novels: [newNovel, ...state.novels] }))
  },

  updateNovel: async (id, novel) => {
    await dbService.updateNovel(id, novel)
    set((state) => ({
      novels: state.novels.map(n => n.id === id ? { ...n, ...novel } : n),
    }))
  },

  removeNovel: async (id) => {
    await dbService.deleteNovel(id)
    set((state) => ({ novels: state.novels.filter(n => n.id !== id) }))
  },

  setCurrentNovel: (novelId) => set({ currentNovel: novelId }),

  // 章节相关操作
  setChapters: (chapters) => set({ chapters }),
  
  loadChapters: async (novelId) => {
    const chapters = await dbService.getChaptersByNovelId(novelId)
    set({ chapters })
  },

  addChapter: async (chapter) => {
    const newChapter = await dbService.createChapter(chapter)
    set((state) => ({ chapters: [...state.chapters, newChapter] }))
  },

  updateChapter: async (id, chapter) => {
    await dbService.updateChapter(id, chapter)
    set((state) => ({
      chapters: state.chapters.map(c => c.id === id ? { ...c, ...chapter } : c),
    }))
  },

  removeChapter: async (id) => {
    await dbService.deleteChapter(id)
    set((state) => ({ chapters: state.chapters.filter(c => c.id !== id) }))
  },

  setSelectedChapter: (chapter) => set({ selectedChapter: chapter }),

  // 提示词相关操作
  setPrompts: (prompts) => set({ prompts }),
  
  addPrompt: async (prompt) => {
    const newPrompt = await dbService.createPrompt(prompt)
    set((state) => ({ prompts: [newPrompt, ...state.prompts] }))
  },

  updatePrompt: async (id, prompt) => {
    await dbService.updatePrompt(id, prompt)
    set((state) => ({
      prompts: state.prompts.map(p => p.id === id ? { ...p, ...prompt } : p),
    }))
  },

  removePrompt: async (id) => {
    await dbService.deletePrompt(id)
    set((state) => ({ prompts: state.prompts.filter(p => p.id !== id) }))
  },

  // 写作目标相关操作
  setWritingGoals: (goals) => set({ writingGoals }),
  
  addWritingGoal: async (goal) => {
    const newGoal = await dbService.createWritingGoal(goal)
    set((state) => ({ writingGoals: [newGoal, ...state.writingGoals] }))
  },

  updateWritingGoal: async (id, goal) => {
    await dbService.updateWritingGoal(id, goal)
    set((state) => ({
      writingGoals: state.writingGoals.map(g => g.id === id ? { ...g, ...goal } : g),
    }))
  },

  removeWritingGoal: async (id) => {
    await dbService.deleteWritingGoal(id)
    set((state) => ({ writingGoals: state.writingGoals.filter(g => g.id !== id) }))
  },

  // 短文相关操作
  setShortStories: (stories) => set({ shortStories: stories }),
  
  addShortStory: async (story) => {
    const newStory = await dbService.createShortStory(story)
    set((state) => ({ shortStories: [newStory, ...state.shortStories] }))
  },

  removeShortStory: async (id) => {
    await dbService.deleteShortStory(id)
    set((state) => ({ shortStories: state.shortStories.filter(s => s.id !== id) }))
  },

  // 拆书分析相关操作
  setBookAnalyses: (analyses) => set({ bookAnalyses }),
  
  addBookAnalysis: async (analysis) => {
    const newAnalysis = await dbService.createBookAnalysis(analysis)
    set((state) => ({ bookAnalyses: [newAnalysis, ...state.bookAnalyses] }))
  },

  removeBookAnalysis: async (id) => {
    await dbService.deleteBookAnalysis(id)
    set((state) => ({ bookAnalyses: state.bookAnalyses.filter(a => a.id !== id) }))
  },

  // 计费记录相关操作
  addBillingRecord: async (record) => {
    await dbService.createBillingRecord(record)
    set((state) => ({
      billingRecords: [record, ...state.billingRecords],
      usageStats: {
        ...state.usageStats,
        totalTokens: state.usageStats.totalTokens + record.totalTokens,
        totalCost: state.usageStats.totalCost + record.cost,
        callCount: state.usageStats.callCount + 1,
      },
    }))
  },

  removeBillingRecord: async (id) => {
    await dbService.deleteBillingRecord(id)
    set((state) => ({ billingRecords: state.billingRecords.filter(r => r.id !== id) }))
  },

  // 简化方法（兼容原有接口）
  setKeywords: (keywords) => set({ keywords }),
  setOutline: (outline) => set({ outline }),
  setTemplate: (template) => set({ selectedTemplate: template }),
  addToNovel: (content) => set((state) => ({
    currentNovel: state.currentNovel + content,
  })),
  setCharacters: (characters) => set({ characters }),
  setWorldSettings: (settings) => set({ worldSettings: set }),
  setTemplateList: (templates) => set({ templates }),
  setPromptList: (prompts) => set({ prompts }),
  setWorldSettingList: (settings) => set({ worldSettings: settings }),
  setCharacterList: (characters) => set({ characters: characters }),
  
  // UI状态
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setDarkMode: (dark) => set({ darkMode: dark }),

  // API配置
  setApiConfig: (config) => {
    if (config.type === 'official') {
      set({
        officialApiConfig: config,
        currentConfigType: 'official',
        isApiConfigured: !!config.apiKey,
      })
    } else {
      set({
        customApiConfig: config,
        currentConfigType: 'custom',
        isApiConfigured: !!config.apiKey,
      })
    }
  },

  // 备份相关
  createBackup: () => {
    const state = get()
    const backup: Backup = {
      id: generateId(),
      name: `备份-${new Date().toLocaleString()}`,
      data: {
        novels: state.novels,
        prompts: state.prompts,
        writingGoals: state.writingGoals,
        shortStories: state.shortStories,
        bookAnalyses: state.bookAnalyses,
      },
      createdAt: new Date().toISOString(),
      size: JSON.stringify(state).length,
    }
    set((state) => ({ backups: [backup, ...state.backups] }))
  },

  // 添加到当前小说
  addToCurrentNovel: (content: string) => {
    set(state => ({
      currentNovel: state.currentNovel + content
    }))
  },
}))

// 类型辅助
type NovelStoreActions = {
  initDb: () => Promise<void>
  setNovels: (novels: Novel[]) => void
  addNovel: (novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateNovel: (id: string, novel: Partial<Novel>) => Promise<void>
  removeNovel: (id: string) => Promise<void>
  setCurrentNovel: (novelId: string) => void
  setChapters: (chapters: Chapter[]) => void
  loadChapters: (novelId: string) => Promise<void>
  addChapter: (chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateChapter: (id: string, chapter: Partial<Chapter>) => Promise<void>
  removeChapter: (id: string) => Promise<void>
  setSelectedChapter: (chapter: Chapter | null) => void
  setPrompts: (prompts: Prompt[]) => void
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updatePrompt: (id: string, prompt: Partial<Prompt>) => Promise<void>
  removePrompt: (id: string) => Promise<void>
  setWritingGoals: (goals: WritingGoal[]) => void
  addWritingGoal: (goal: Omit<WritingGoal, 'id' | 'createdAt'>) => Promise<void>
  updateWritingGoal: (id: string, goal: Partial<WritingGoal>) => Promise<void>
  removeWritingGoal: (id: string) => Promise<void>
  setShortStories: (stories: ShortStory[]) => void
  addShortStory: (story: Omit<ShortStory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  removeShortStory: (id: string) => Promise<void>
  setBookAnalyses: (analyses: BookAnalysis[]) => void
  addBookAnalysis: (analysis: Omit<BookAnalysis, 'id' | 'createdAt'>) => Promise<void>
  removeBookAnalysis: (id: string) => Promise<void>
  addBillingRecord: (record: Omit<BillingRecord, 'id'>) => Promise<void>
  removeBillingRecord: (id: string) => Promise<void>
  setKeywords: (keywords: string) => void
  setOutline: (outline: string) => void
  setTemplate: (template: Template | null) => void
  addToNovel: (content: string) => void
  setCharacters: (characters: Character[]) => void
  setWorldSettings: (settings: WorldSetting[]) => void
  setTemplateList: (templates: Template[]) => void
  setPromptList: (prompts: Prompt[]) => void
  setWorldSettingList: (settings: WorldSetting[]) => void
  setCharacterList: (characters: Character[]) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setDarkMode: (dark: boolean) => void
  setApiConfig: (config: ApiConfig) => void
  createBackup: () => void
  addToCurrentNovel: (content: string) => void
}
