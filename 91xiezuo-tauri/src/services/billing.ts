import type { BillingRecord, UsageStats, ModelConfig } from '@/types'
import { useNovelStore } from '@/store/novelStore'
import { loadFromLocalStorage, saveToLocalStorage, formatDate } from '@/lib/utils'
import { OFFICIAL_MODELS, DEFAULT_CUSTOM_MODELS } from './api'
import { generateId } from '@/lib/utils'

// 计费服务
export class BillingService {
  // 估算token数
  static estimateTokens(text: string): number {
    // 粗略估算：中文字符约等于0.5个token，英文单词约等于0.25个token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length
    return Math.ceil(chineseChars * 0.5 + englishWords * 0.25)
  }

  // 计算费用
  static calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const officialModel = OFFICIAL_MODELS.find((m) => m.id === model)
    if (officialModel) {
      // 官方API按次计费
      return officialModel.price || 0.1
    }

    // 自定义API按token计费（示例价格）
    const inputPrice = 0.0001
    const outputPrice = 0.0002
    return inputTokens * inputPrice + outputTokens * outputPrice
  }

  // 获取账户余额（模拟）
  static getAccountBalance(): number {
    // 实际项目中应该从后端获取
    return 1000 // 默认1000元余额
  }

  // 获取计费记录
  static getBillingRecords(): BillingRecord[] {
    const store = useNovelStore()
    return store.billingRecords
  }

  // 获取使用统计
  static getUsageStats(): UsageStats {
    const store = useNovelStore()
    return store.usageStats
  }

  // 获取今日统计
  static getTodayStats(): {
    tokens: number
    cost: number
    calls: number
  } {
    const records = this.getBillingRecords()
    const today = new Date().toDateString()

    const todayRecords = records.filter(
      (r) => new Date(r.timestamp).toDateString() === today
    )

    return {
      tokens: todayRecords.reduce((sum, r) => sum + r.totalTokens, 0),
      cost: todayRecords.reduce((sum, r) => sum + r.cost, 0),
      calls: todayRecords.filter((r) => r.status === 'success').length,
    }
  }

  // 获取使用趋势（最近7天）
  static getUsageTrend(): Array<{ date: string; tokens: number; cost: number }> {
    const records = this.getBillingRecords()
    const trend: Array<{ date: string; tokens: number; cost: number }> = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()

      const dayRecords = records.filter(
        (r) => new Date(r.timestamp).toDateString() === dateStr
      )

      trend.push({
        date: formatDate(date),
        tokens: dayRecords.reduce((sum, r) => sum + r.totalTokens, 0),
        cost: dayRecords.reduce((sum, r) => sum + r.cost, 0),
      })
    }

    return trend
  }

  // 获取模型使用统计
  static getModelStats(): Array<{ model: string; calls: number; tokens: number; cost: number }> {
    const records = this.getBillingRecords()
    const modelStats = new Map<string, { calls: number; tokens: number; cost: number }>()

    records.forEach((record) => {
      const stats = modelStats.get(record.model) || { calls: 0, tokens: 0, cost: 0 }
      stats.calls++
      stats.tokens += record.totalTokens
      stats.cost += record.cost
      modelStats.set(record.model, stats)
    })

    return Array.from(modelStats.entries()).map(([model, stats]) => ({
      model,
      ...stats,
    }))
  }

  // 导出计费数据
  static exportBillingData(format: 'json' | 'csv' = 'json'): string {
    const records = this.getBillingRecords()

    if (format === 'json') {
      return JSON.stringify(records, null, 2)
    }

    if (format === 'csv') {
      const headers = ['ID', 'Model', 'Input Tokens', 'Output Tokens', 'Total Tokens', 'Cost', 'Status', 'Timestamp']
      const rows = records.map((r) => [
        r.id,
        r.model,
        r.inputTokens,
        r.outputTokens,
        r.totalTokens,
        r.cost.toFixed(4),
        r.status,
        r.timestamp,
      ])
      return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    }

    return ''
  }

  // 清理过期记录（保留最近30天）
  static cleanOldRecords(): void {
    const store = useNovelStore()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const filteredRecords = store.billingRecords.filter(
      (r) => new Date(r.timestamp) >= thirtyDaysAgo
    )

    store.billingRecords = filteredRecords
    saveToLocalStorage('billingRecords', filteredRecords)
  }

  // 重新计算统计数据
  static recalculateStats(): void {
    const store = useNovelStore()
    const records = store.billingRecords

    const today = new Date().toDateString()
    const todayRecords = records.filter(
      (r) => new Date(r.timestamp).toDateString() === today
    )

    const usageStats: UsageStats = {
      totalTokens: records.reduce((sum, r) => sum + r.totalTokens, 0),
      totalCost: records.reduce((sum, r) => sum + r.cost, 0),
      todayTokens: todayRecords.reduce((sum, r) => sum + r.totalTokens, 0),
      todayCost: todayRecords.reduce((sum, r) => sum + r.cost, 0),
      callCount: records.filter((r) => r.status === 'success').length,
    }

    store.usageStats = usageStats
    saveToLocalStorage('usageStats', usageStats)
  }
}

// 获取模型列表
export function getModelList(): ModelConfig[] {
  const store = useNovelStore()
  const customModels = loadFromLocalStorage('customModels', DEFAULT_CUSTOM_MODELS)
  return store.currentConfigType === 'official'
    ? OFFICIAL_MODELS
    : customModels
}

// 添加自定义模型
export function addCustomModel(model: ModelConfig): void {
  const customModels = loadFromLocalStorage('customModels', DEFAULT_CUSTOM_MODELS)
  customModels.push(model)
  saveToLocalStorage('customModels', customModels)
}

// 移除自定义模型
export function removeCustomModel(modelId: string): void {
  const customModels = loadFromLocalStorage('customModels', DEFAULT_CUSTOM_MODELS)
  const filtered = customModels.filter((m) => m.id !== modelId)
  saveToLocalStorage('customModels', filtered)
}

// 获取模型价格
export function getModelPrice(model: string): number | undefined {
  const allModels = [...OFFICIAL_MODELS, ...DEFAULT_CUSTOM_MODELS]
  return allModels.find((m) => m.id === model)?.price
}
