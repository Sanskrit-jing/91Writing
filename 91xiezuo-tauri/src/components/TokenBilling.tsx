import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  BarChart3,
  PieChart,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { BillingRecord, UsageStats } from '@/types'

// 模拟数据
const mockBillingRecords: BillingRecord[] = [
  {
    id: '1',
    model: 'gpt-4',
    inputTokens: 1500,
    outputTokens: 800,
    totalTokens: 2300,
    cost: 0.138,
    status: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    model: 'gpt-3.5-turbo',
    inputTokens: 800,
    outputTokens: 500,
    totalTokens: 1300,
    cost: 0.00325,
    status: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    model: 'gpt-4',
    inputTokens: 2000,
    outputTokens: 1200,
    totalTokens: 3200,
    cost: 0.192,
    status: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: '4',
    model: 'gpt-3.5-turbo',
    inputTokens: 500,
    outputTokens: 0,
    totalTokens: 500,
    cost: 0.00125,
    status: 'failed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    error: 'API rate limit exceeded',
  },
  {
    id: '5',
    model: 'gpt-4',
    inputTokens: 3000,
    outputTokens: 2000,
    totalTokens: 5000,
    cost: 0.3,
    status: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

const mockUsageStats: UsageStats = {
  totalTokens: 7300,
  totalCost: 0.335,
  todayTokens: 4600,
  todayCost: 0.238,
  callCount: 4,
}

const modelPrices = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
}

export default function TokenBilling() {
  const [records, setRecords] = useState<BillingRecord[]>(mockBillingRecords)
  const [stats, setStats] = useState<UsageStats>(mockUsageStats)
  const [timeRange, setTimeRange] = useState('7')
  const [modelFilter, setModelFilter] = useState('all')

  const filteredRecords = records.filter(record => {
    const matchesModel = modelFilter === 'all' || record.model === modelFilter
    return matchesModel
  })

  const calculateCost = (model: string, inputTokens: number, outputTokens: number) => {
    const prices = modelPrices[model as keyof typeof modelPrices]
    if (!prices) return 0
    return (inputTokens / 1000) * prices.input + (outputTokens / 1000) * prices.output
  }

  const handleExport = () => {
    const csvContent = [
      ['时间', '模型', '输入Token', '输出Token', '总Token', '费用', '状态'],
      ...records.map(r => [
        formatDate(r.timestamp),
        r.model,
        r.inputTokens.toString(),
        r.outputTokens.toString(),
        r.totalTokens.toString(),
        r.cost.toFixed(4),
        r.status,
      ]),
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `billing-records-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getModelColor = (model: string) => {
    switch (model) {
      case 'gpt-4':
        return 'text-green-600 bg-green-100'
      case 'gpt-4-turbo':
        return 'text-blue-600 bg-blue-100'
      case 'gpt-3.5-turbo':
        return 'text-purple-600 bg-purple-100'
      case 'claude-3-opus':
        return 'text-orange-600 bg-orange-100'
      case 'claude-3-sonnet':
        return 'text-pink-600 bg-pink-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="h-full p-6 space-y-6">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Token计费</h1>
        <p className="text-muted-foreground">查看和管理API使用费用</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">总消耗Token</span>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            输入: {(records.reduce((sum, r) => sum + r.inputTokens, 0)).toLocaleString()} / 
            输出: {(records.reduce((sum, r) => sum + r.outputTokens, 0)).toLocaleString()}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">总费用</span>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-primary">¥{stats.totalCost.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.callCount} 次API调用
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">今日Token</span>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.todayTokens.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            ¥{stats.todayCost.toFixed(2)} 今日费用
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">成功率</span>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {((records.filter(r => r.status === 'success').length / records.length) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {records.filter(r => r.status === 'success').length} / {records.length} 次成功
          </div>
        </Card>
      </div>

      {/* 筛选和导出 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 items-center w-full md:w-auto">
            <div>
              <Label>时间范围</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">今天</SelectItem>
                  <SelectItem value="7">近7天</SelectItem>
                  <SelectItem value="30">近30天</SelectItem>
                  <SelectItem value="all">全部</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>模型筛选</Label>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部模型</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude-3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude-3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline" className="w-full md:w-auto">
            <Download className="h-4 w-4 mr-2" />
            导出记录
          </Button>
        </div>
      </Card>

      {/* 详细记录 */}
      <Card className="flex-1 overflow-hidden">
        <Tabs defaultValue="records" className="h-full flex flex-col">
          <div className="p-4 border-b">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="records">使用记录</TabsTrigger>
              <TabsTrigger value="analysis">费用分析</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="records" className="flex-1 overflow-auto p-0">
            <div className="divide-y">
              {filteredRecords.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  暂无记录
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getModelColor(record.model)}`}>
                          {record.model}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 text-sm mb-1">
                            <span className="text-muted-foreground">
                              输入: {record.inputTokens.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">
                              输出: {record.outputTokens.toLocaleString()}
                            </span>
                            <span className="font-medium">
                              总计: {record.totalTokens.toLocaleString()} tokens
                            </span>
                          </div>
                          {record.status === 'failed' && record.error && (
                            <div className="text-xs text-red-600">
                              {record.error}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${record.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          ¥{record.cost.toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(record.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {/* 模型使用分布 */}
              <div>
                <h3 className="font-semibold mb-4">模型使用分布</h3>
                <div className="space-y-3">
                  {Object.entries(modelPrices).map(([model, prices]) => {
                    const modelRecords = records.filter(r => r.model === model)
                    const totalTokens = modelRecords.reduce((sum, r) => sum + r.totalTokens, 0)
                    const percentage = records.length > 0 ? (modelRecords.length / records.length) * 100 : 0
                    
                    if (modelRecords.length === 0) return null
                    
                    return (
                      <div key={model}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{model}</span>
                          <span className="text-sm text-muted-foreground">
                            {totalTokens.toLocaleString()} tokens ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getModelColor(model).split(' ')[1]} transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 费用趋势 */}
              <div>
                <h3 className="font-semibold mb-4">最近费用趋势</h3>
                <div className="grid grid-cols-7 gap-2">
                  {records.slice(0, 7).map((record, index) => (
                    <div key={record.id} className="text-center">
                      <div className="text-2xl font-bold mb-1">
                        {record.status === 'success' ? (
                          <TrendingUp className="h-8 w-8 mx-auto text-green-600" />
                        ) : (
                          <TrendingDown className="h-8 w-8 mx-auto text-red-600" />
                        )}
                      </div>
                      <div className="text-xs font-medium">¥{record.cost.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground">
                        {index === 0 ? '今天' : `${index}天前`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 费用建议 */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">费用优化建议</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• GPT-3.5 Turbo 适合简单任务，成本更低</li>
                  <li>• 优化提示词可以减少输出Token数量</li>
                  <li>• 使用流式响应可以提升用户体验</li>
                  <li>• 定期清理不需要的API调用</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
