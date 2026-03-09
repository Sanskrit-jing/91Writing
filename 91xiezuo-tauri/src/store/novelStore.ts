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
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  generateId,
  calculateReadingTime,
} from '@/lib/utils'

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
}

export const useNovelStore = create<NovelState>((set, get) => ({
  // 初始状态
  currentNovel: loadFromLocalStorage('currentNovel', ''),
  generatedContent: '',
  outline: loadFromLocalStorage('outline', ''),
  chapters: loadFromLocalStorage('chapters', []),
  selectedChapter: null,
  novels: loadFromLocalStorage('novels', []),

  isGeneratingOutline: false,
  isGeneratingChapter: false,
  isGenerating: false,

  aiChatHistory: loadFromLocalStorage('aiChatHistory', []),
  currentChatInput: '',
  isAiChatting: false,

  templates: loadFromLocalStorage('templates', []),
  selectedTemplate: null,
  keywords: loadFromLocalStorage('keywords', ''),

  characters: loadFromLocalStorage('characters', []),
  worldSettings: loadFromLocalStorage('worldSettings', []),
  corpus: loadFromLocalStorage('corpus', []),
  prompts: loadFromLocalStorage('prompts', []),

  articleStats: null,
  articleSummary: '',
  writingAdvice: '',

  officialApiConfig: loadFromLocalStorage('officialApiConfig', null),
  customApiConfig: loadFromLocalStorage('customApiConfig', null),
  currentConfigType: loadFromLocalStorage('currentConfigType', 'official' as ConfigType),
  isApiConfigured: false,

  billingRecords: loadFromLocalStorage('billingRecords', []),
  usageStats: loadFromLocalStorage('usageStats', {
    totalTokens: 0,
    totalCost: 0,
    todayTokens: 0,
    todayCost: 0,
    callCount: 0,
  }),

  writingGoals: loadFromLocalStorage('writingGoals', []),
  shortStories: loadFromLocalStorage('shortStories', []),
  bookAnalyses: loadFromLocalStorage('bookAnalyses', []),

  backups: loadFromLocalStorage('backups', []),
  toolResults: [],

  sidebarCollapsed: loadFromLocalStorage('sidebarCollapsed', false),
  darkMode: loadFromLocalStorage('darkMode', false),

  // Actions
  setCurrentNovel: (content: string) => {
    set({ currentNovel: content })
    saveToLocalStorage('currentNovel', content)
  },

  addToNovel: (content: string) => {
    set((state) => ({
      currentNovel: state.currentNovel + content,
    }))
    saveToLocalStorage('currentNovel', get().currentNovel)
  },

  clearNovel: () => {
    set({ currentNovel: '', generatedContent: '', outline: '', chapters: [] })
    saveToLocalStorage('currentNovel', '')
    saveToLocalStorage('outline', '')
    saveToLocalStorage('chapters', [])
  },

  setOutline: (outline: string) => {
    set({ outline })
    saveToLocalStorage('outline', outline)
  },

  setChapters: (chapters: Chapter[]) => {
    set({ chapters })
    saveToLocalStorage('chapters', chapters)
  },

  setSelectedChapter: (chapter: Chapter | null) => {
    set({ selectedChapter: chapter })
  },

  setGeneratingOutline: (isGenerating: boolean) => set({ isGeneratingOutline: isGenerating }),
  setGeneratingChapter: (isGenerating: boolean) => set({ isGeneratingChapter: isGenerating }),
  setGenerating: (isGenerating: boolean) => set({ isGenerating: isGenerating }),

  addChatMessage: (message: ChatMessage) => {
    set((state) => ({
      aiChatHistory: [...state.aiChatHistory, message],
    }))
    saveToLocalStorage('aiChatHistory', get().aiChatHistory)
  },

  clearChatHistory: () => {
    set({ aiChatHistory: [] })
    saveToLocalStorage('aiChatHistory', [])
  },

  setCurrentChatInput: (input: string) => set({ currentChatInput: input }),
  setAiChatting: (isChatting: boolean) => set({ isAiChatting: isChatting }),

  setTemplates: (templates: Template[]) => {
    set({ templates })
    saveToLocalStorage('templates', templates)
  },

  setSelectedTemplate: (template: Template | null) => set({ selectedTemplate: template }),
  setKeywords: (keywords: string) => {
    set({ keywords })
    saveToLocalStorage('keywords', keywords)
  },

  addCharacter: (character: Character) => {
    set((state) => ({
      characters: [...state.characters, character],
    }))
    saveToLocalStorage('characters', get().characters)
  },

  removeCharacter: (id: string) => {
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id),
    }))
    saveToLocalStorage('characters', get().characters)
  },

  addWorldSetting: (setting: WorldSetting) => {
    set((state) => ({
      worldSettings: [...state.worldSettings, setting],
    }))
    saveToLocalStorage('worldSettings', get().worldSettings)
  },

  removeWorldSetting: (id: string) => {
    set((state) => ({
      worldSettings: state.worldSettings.filter((w) => w.id !== id),
    }))
    saveToLocalStorage('worldSettings', get().worldSettings)
  },

  addCorpus: (item: Corpus) => {
    set((state) => ({
      corpus: [...state.corpus, item],
    }))
    saveToLocalStorage('corpus', get().corpus)
  },

  removeCorpus: (id: string) => {
    set((state) => ({
      corpus: state.corpus.filter((c) => c.id !== id),
    }))
    saveToLocalStorage('corpus', get().corpus)
  },

  addPrompt: (prompt: Prompt) => {
    set((state) => ({
      prompts: [...state.prompts, prompt],
    }))
    saveToLocalStorage('prompts', get().prompts)
  },

  removePrompt: (id: string) => {
    set((state) => ({
      prompts: state.prompts.filter((p) => p.id !== id),
    }))
    saveToLocalStorage('prompts', get().prompts)
  },

  updatePrompt: (id: string, updatedPrompt: Partial<Prompt>) => {
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, ...updatedPrompt } : p
      ),
    }))
    saveToLocalStorage('prompts', get().prompts)
  },

  setArticleStats: (stats: ArticleStats | null) => set({ articleStats: stats }),
  setArticleSummary: (summary: string) => set({ articleSummary: summary }),
  setWritingAdvice: (advice: string) => set({ writingAdvice: advice }),

  updateApiConfig: (configType: ConfigType, config: OfficialApiConfig | CustomApiConfig) => {
    if (configType === 'official') {
      set({ officialApiConfig: config as OfficialApiConfig })
      saveToLocalStorage('officialApiConfig', config)
    } else {
      set({ customApiConfig: config as CustomApiConfig })
      saveToLocalStorage('customApiConfig', config)
    }
    set({ isApiConfigured: true })
  },

  switchConfigType: (type: ConfigType) => {
    set({ currentConfigType: type })
    saveToLocalStorage('currentConfigType', type)
  },

  addBillingRecord: (record: BillingRecord) => {
    set((state) => {
      const newRecords = [record, ...state.billingRecords]
      const today = new Date().toDateString()
      const todayRecords = newRecords.filter(
        (r) => new Date(r.timestamp).toDateString() === today
      )
      const todayTokens = todayRecords.reduce((sum, r) => sum + r.totalTokens, 0)
      const todayCost = todayRecords.reduce((sum, r) => sum + r.cost, 0)
      const totalTokens = newRecords.reduce((sum, r) => sum + r.totalTokens, 0)
      const totalCost = newRecords.reduce((sum, r) => sum + r.cost, 0)

      const newUsageStats: UsageStats = {
        totalTokens,
        totalCost,
        todayTokens,
        todayCost,
        callCount: newRecords.filter((r) => r.status === 'success').length,
      }

      return {
        billingRecords: newRecords,
        usageStats: newUsageStats,
      }
    })
    saveToLocalStorage('billingRecords', get().billingRecords)
    saveToLocalStorage('usageStats', get().usageStats)
  },

  addWritingGoal: (goal: WritingGoal) => {
    set((state) => ({
      writingGoals: [...state.writingGoals, goal],
    }))
    saveToLocalStorage('writingGoals', get().writingGoals)
  },

  updateWritingGoal: (id: string, updatedGoal: Partial<WritingGoal>) => {
    set((state) => ({
      writingGoals: state.writingGoals.map((g) =>
        g.id === id ? { ...g, ...updatedGoal } : g
      ),
    }))
    saveToLocalStorage('writingGoals', get().writingGoals)
  },

  removeWritingGoal: (id: string) => {
    set((state) => ({
      writingGoals: state.writingGoals.filter((g) => g.id !== id),
    }))
    saveToLocalStorage('writingGoals', get().writingGoals)
  },

  addNovel: (novel: Novel) => {
    set((state) => ({
      novels: [...state.novels, novel],
    }))
    saveToLocalStorage('novels', get().novels)
  },

  updateNovel: (id: string, updatedNovel: Partial<Novel>) => {
    set((state) => ({
      novels: state.novels.map((n) => (n.id === id ? { ...n, ...updatedNovel } : n)),
    }))
    saveToLocalStorage('novels', get().novels)
  },

  removeNovel: (id: string) => {
    set((state) => ({
      novels: state.novels.filter((n) => n.id !== id),
    }))
    saveToLocalStorage('novels', get().novels)
  },

  addShortStory: (story: ShortStory) => {
    set((state) => ({
      shortStories: [...state.shortStories, story],
    }))
    saveToLocalStorage('shortStories', get().shortStories)
  },

  removeShortStory: (id: string) => {
    set((state) => ({
      shortStories: state.shortStories.filter((s) => s.id !== id),
    }))
    saveToLocalStorage('shortStories', get().shortStories)
  },

  addBookAnalysis: (analysis: BookAnalysis) => {
    set((state) => ({
      bookAnalyses: [...state.bookAnalyses, analysis],
    }))
    saveToLocalStorage('bookAnalyses', get().bookAnalyses)
  },

  removeBookAnalysis: (id: string) => {
    set((state) => ({
      bookAnalyses: state.bookAnalyses.filter((b) => b.id !== id),
    }))
    saveToLocalStorage('bookAnalyses', get().bookAnalyses)
  },

  addBackup: (backup: Backup) => {
    set((state) => ({
      backups: [...state.backups, backup],
    }))
    saveToLocalStorage('backups', get().backups)
  },

  removeBackup: (id: string) => {
    set((state) => ({
      backups: state.backups.filter((b) => b.id !== id),
    }))
    saveToLocalStorage('backups', get().backups)
  },

  addToolResult: (result: ToolResult) => {
    set((state) => ({
      toolResults: [result, ...state.toolResults],
    }))
  },

  toggleSidebar: () => {
    set((state) => {
      const newState = !state.sidebarCollapsed
      saveToLocalStorage('sidebarCollapsed', newState)
      return { sidebarCollapsed: newState }
    })
  },

  toggleDarkMode: () => {
    set((state) => {
      const newState = !state.darkMode
      saveToLocalStorage('darkMode', newState)
      return { darkMode: newState }
    })
  },

  // Getters
  get wordCount() {
    return get().currentNovel.length
  },

  get readingTime() {
    return calculateReadingTime(get().currentNovel)
  },

  get currentApiConfig() {
    const { currentConfigType, officialApiConfig, customApiConfig } = get()
    return currentConfigType === 'official' ? officialApiConfig : customApiConfig
  },
}))
