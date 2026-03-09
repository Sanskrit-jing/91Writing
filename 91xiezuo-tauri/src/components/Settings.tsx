import { useState } from 'react'
import { useNovelStore } from '@/store/novelStore'
import * as dbService from '@/lib/dbService'
import { shouldMigrate, migrateFromLocalStorage } from '@/lib/migration'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import {
  Settings as SettingsIcon,
  Key,
  Palette,
  FileText,
  Database,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info,
  Bell,
  Globe,
  Zap,
  ArrowRight,
} from 'lucide-react'

interface AppSettings {
  // API 配置
  apiKey: string
  baseUrl: string
  model: string
  temperature: number
  maxTokens: number
  
  // 编辑器设置
  fontSize: number
  fontFamily: string
  lineHeight: number
  autoSave: boolean
  autoSaveInterval: number
  
  // 界面设置
  theme: 'light' | 'dark' | 'system'
  language: 'zh' | 'en'
  
  // 通知设置
  enableNotifications: boolean
  notificationSound: boolean
  
  // 性能设置
  streamingResponse: boolean
  cacheEnabled: boolean
}

const defaultSettings: AppSettings = {
  apiKey: '',
  baseUrl: 'https://ai.91hub.vip/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000,
  fontSize: 14,
  fontFamily: 'system-ui',
  lineHeight: 1.6,
  autoSave: true,
  autoSaveInterval: 30,
  theme: 'system',
  language: 'zh',
  enableNotifications: true,
  notificationSound: false,
  streamingResponse: true,
  cacheEnabled: true,
}

export default function Settings() {
  const store = useNovelStore()
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings')
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  })
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle')
  const [testMessage, setTestMessage] = useState('')

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
    store.setApiConfig({
      type: settings.baseUrl.includes('91hub') ? 'official' : 'custom',
      apiKey: settings.apiKey,
      baseUrl: settings.baseUrl,
      model: settings.model,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
    })
    alert('设置已保存')
  }

  const resetSettings = () => {
    if (confirm('确定要重置所有设置吗？')) {
      setSettings(defaultSettings)
      localStorage.removeItem('appSettings')
      alert('设置已重置')
    }
  }

  const testConnection = async () => {
    setTestStatus('testing')
    setTestMessage('')

    try {
      const response = await fetch(`${settings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10,
        }),
      })

      if (response.ok) {
        setTestStatus('success')
        setTestMessage('连接成功！')
      } else {
        const error = await response.json()
        setTestStatus('failed')
        setTestMessage(error.error?.message || '连接失败')
      }
    } catch (error) {
      setTestStatus('failed')
      setTestMessage('网络错误，请检查URL和API密钥')
    }
  }

  const exportData = () => {
    const data = {
      novels: store.novels,
      characters: store.characters,
      worldSettings: store.worldSettings,
      templates: store.templates,
      prompts: store.prompts,
      settings,
      exportDate: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `91xiezuo-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)
        
        if (confirm('导入将覆盖当前数据，确定要继续吗？')) {
          if (data.novels) store.setNovels(data.novels)
          if (data.characters) store.setCharacterList(data.characters)
          if (data.worldSettings) store.setWorldSettingList(data.worldSettings)
          if (data.templates) store.setTemplateList(data.templates)
          if (data.prompts) store.setPromptList(data.prompts)
          if (data.settings) {
            setSettings(data.settings)
            localStorage.setItem('appSettings', JSON.stringify(data.settings))
          }
          alert('导入成功')
        }
      } catch (error) {
        alert('导入失败，文件格式错误')
      }
    }
    input.click()
  }

  const clearAllData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      localStorage.clear()
      setSettings(defaultSettings)
      alert('数据已清除')
    }
  }

  return (
    <div className="h-full p-6 space-y-6">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold mb-2">系统设置</h1>
        <p className="text-muted-foreground">配置您的写作环境和API设置</p>
      </div>

      <Tabs defaultValue="api" className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b">
          <TabsList className="grid w-full max-w-4xl">
            <TabsTrigger value="api">
              <Key className="h-4 w-4 mr-2" />
              API配置
            </TabsTrigger>
            <TabsTrigger value="editor">
              <FileText className="h-4 w-4 mr-2" />
              编辑器
            </TabsTrigger>
            <TabsTrigger value="interface">
              <Palette className="h-4 w-4 mr-2" />
              界面
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              通知
            </TabsTrigger>
            <TabsTrigger value="data">
              <Database className="h-4 w-4 mr-2" />
              数据管理
            </TabsTrigger>
            <TabsTrigger value="about">
              <Info className="h-4 w-4 mr-2" />
              关于
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="api" className="flex-1 overflow-auto mt-6">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">API 配置</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">API 密钥 *</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="输入您的API密钥"
                      value={settings.apiKey}
                      onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="base-url">API 地址</Label>
                    <Input
                      id="base-url"
                      placeholder="https://api.openai.com/v1"
                      value={settings.baseUrl}
                      onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">模型</Label>
                    <Select value={settings.model} onValueChange={(value) => setSettings({ ...settings, model: value })}>
                      <SelectTrigger id="model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="claude-3-opus">Claude-3 Opus</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude-3 Sonnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="temperature">温度 ({settings.temperature.toFixed(1)})</Label>
                    <input
                      id="temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-tokens">最大Token数</Label>
                    <Input
                      id="max-tokens"
                      type="number"
                      value={settings.maxTokens}
                      onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={testConnection} disabled={!settings.apiKey || testStatus === 'testing'}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                  测试连接
                </Button>
                <Button onClick={saveSettings}>保存设置</Button>
              </div>

              {testStatus !== 'idle' && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  testStatus === 'success' ? 'bg-green-50 text-green-700' :
                  testStatus === 'failed' ? 'bg-red-50 text-red-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {testStatus === 'success' && <CheckCircle className="h-5 w-5" />}
                  {testStatus === 'failed' && <XCircle className="h-5 w-5" />}
                  {testStatus === 'testing' && <RefreshCw className="h-5 w-5 animate-spin" />}
                  <span>{testMessage || (testStatus === 'testing' ? '测试中...' : '')}</span>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="flex-1 overflow-auto mt-6">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">编辑器设置</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="font-size">字体大小 ({settings.fontSize}px)</Label>
                    <input
                      id="font-size"
                      type="range"
                      min="12"
                      max="24"
                      step="1"
                      value={settings.fontSize}
                      onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="line-height">行高 ({settings.lineHeight})</Label>
                    <input
                      id="line-height"
                      type="range"
                      min="1.2"
                      max="2.0"
                      step="0.1"
                      value={settings.lineHeight}
                      onChange={(e) => setSettings({ ...settings, lineHeight: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save">自动保存</Label>
                    <Switch
                      id="auto-save"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                    />
                  </div>
                  {settings.autoSave && (
                    <div>
                      <Label htmlFor="save-interval">保存间隔 ({settings.autoSaveInterval}秒)</Label>
                      <input
                        id="save-interval"
                        type="range"
                        min="10"
                        max="300"
                        step="10"
                        value={settings.autoSaveInterval}
                        onChange={(e) => setSettings({ ...settings, autoSaveInterval: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={saveSettings}>保存设置</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="flex-1 overflow-auto mt-6">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">界面设置</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="theme">主题</Label>
                    <Select value={settings.theme} onValueChange={(value: 'light' | 'dark' | 'system') => setSettings({ ...settings, theme: value })}>
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">浅色</SelectItem>
                        <SelectItem value="dark">深色</SelectItem>
                        <SelectItem value="system">跟随系统</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">语言</Label>
                    <Select value={settings.language} onValueChange={(value: 'zh' | 'en') => setSettings({ ...settings, language: value })}>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh">简体中文</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={saveSettings}>保存设置</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="flex-1 overflow-auto mt-6">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">通知设置</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable-notifications">启用通知</Label>
                    <Switch
                      id="enable-notifications"
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notification-sound">通知声音</Label>
                    <Switch
                      id="notification-sound"
                      checked={settings.notificationSound}
                      onCheckedChange={(checked) => setSettings({ ...settings, notificationSound: checked })}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={saveSettings}>保存设置</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="flex-1 overflow-auto mt-6">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">数据管理</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={exportData} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      导出数据
                    </Button>
                    <Button onClick={importData} variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      导入数据
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="streaming">流式响应</Label>
                    <Switch
                      id="streaming"
                      checked={settings.streamingResponse}
                      onCheckedChange={(checked) => setSettings({ ...settings, streamingResponse: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cache">启用缓存</Label>
                    <Switch
                      id="cache"
                      checked={settings.cacheEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, cacheEnabled: checked })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-red-600">危险区域</h3>
                <div className="space-y-4">
                  <Button onClick={resetSettings} variant="outline" className="w-full">
                    重置设置
                  </Button>
                  <Button onClick={clearAllData} variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    清除所有数据
                  </Button>
                </div>
              </div>
              
              <Button onClick={saveSettings}>保存设置</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="flex-1 overflow-auto mt-6">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center">
                  <SettingsIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold">91写作 AI</h2>
                <p className="text-muted-foreground">版本 1.0.0</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">技术栈</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Tauri 2 - 桌面应用框架</li>
                  <li>• React 18 - UI 框架</li>
                  <li>• TypeScript - 类型系统</li>
                  <li>• Radix UI - 组件库</li>
                  <li>• Tailwind CSS - 样式系统</li>
                  <li>• Pinia - 状态管理</li>
                  <li>• SQLite - 数据库</li>
                  <li>• FastAPI - 后端API</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">数据库</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">数据存储</span>
                    <span className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      SQLite
                    </span>
                  </div>
                  {shouldMigrate() && (
                    <Button
                      onClick={() => {
                        if (confirm('确定要将 LocalStorage 数据迁移到 SQLite 数据库吗？')) {
                          migrateFromLocalStorage()
                            .then(() => alert('数据迁移完成！'))
                            .catch((error) => alert(`迁移失败：${error.message}`))
                        }
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      迁移 LocalStorage 到 SQLite
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">功能特性</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AI 辅助创作</li>
                  <li>• 小说/章节管理</li>
                  <li>• 工具库集成</li>
                  <li>• 短文写作</li>
                  <li>• 拆书分析</li>
                  <li>• 类型管理</li>
                  <li>• Token 计费</li>
                  <li>• 数据导出/导入</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  © 2024 91写作 AI. All rights reserved.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
