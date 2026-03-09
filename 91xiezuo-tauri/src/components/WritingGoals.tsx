import { useState, useEffect } from 'react'
import { useNovelStore } from '@/store/novelStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Progress } from './ui/progress'
import {
  Target,
  Plus,
  Trash2,
  TrendingUp,
  Calendar,
  Flame,
  CheckCircle2,
} from 'lucide-react'
import { generateId, formatDate } from '@/lib/utils'
import type { WritingGoal } from '@/types'

export default function WritingGoals() {
  const store = useNovelStore()
  const [goals, setGoals] = useState<WritingGoal[]>(store.writingGoals)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<WritingGoal | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    targetWords: 0,
    period: 'daily' as WritingGoal['period'],
  })

  useEffect(() => {
    setGoals(store.writingGoals)
  }, [store.writingGoals])

  const handleOpenDialog = (goal?: WritingGoal) => {
    if (goal) {
      setEditingGoal(goal)
      setFormData({
        title: goal.title,
        targetWords: goal.targetWords,
        period: goal.period,
      })
    } else {
      setEditingGoal(null)
      setFormData({
        title: '',
        targetWords: 0,
        period: 'daily',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingGoal(null)
    setFormData({
      title: '',
      targetWords: 0,
      period: 'daily',
    })
  }

  const handleSave = () => {
    if (!formData.title.trim() || formData.targetWords <= 0) return

    if (editingGoal) {
      const updatedGoal: WritingGoal = {
        ...editingGoal,
        title: formData.title,
        targetWords: formData.targetWords,
        period: formData.period,
      }
      store.updateWritingGoal(editingGoal.id, updatedGoal)
    } else {
      const newGoal: WritingGoal = {
        id: generateId(),
        title: formData.title,
        targetWords: formData.targetWords,
        currentWords: 0,
        period: formData.period,
        startDate: new Date().toISOString(),
        streakDays: 0,
        createdAt: new Date().toISOString(),
      }
      store.addWritingGoal(newGoal)
    }

    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个目标吗？')) {
      store.removeWritingGoal(id)
    }
  }

  const getPeriodText = (period: WritingGoal['period']) => {
    switch (period) {
      case 'daily':
        return '每日目标'
      case 'weekly':
        return '每周目标'
      case 'monthly':
        return '每月目标'
    }
  }

  const getProgressPercent = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100))
  }

  const totalTargetWords = goals.reduce((sum, g) => sum + g.targetWords, 0)
  const totalCurrentWords = goals.reduce((sum, g) => sum + g.currentWords, 0)
  const totalStreakDays = goals.reduce((sum, g) => sum + g.streakDays, 0)

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 标题和统计 */}
      <div>
        <h1 className="text-2xl font-bold mb-4">写作目标</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{goals.length}</div>
                <div className="text-sm text-muted-foreground">活跃目标</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalCurrentWords.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">已写字数</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalStreakDays}</div>
                <div className="text-sm text-muted-foreground">连续天数</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 总体进度 */}
      {goals.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">总体进度</h3>
            <span className="text-sm text-muted-foreground">
              {totalCurrentWords.toLocaleString()} / {totalTargetWords.toLocaleString()} 字
            </span>
          </div>
          <Progress value={getProgressPercent(totalCurrentWords, totalTargetWords)} className="h-3" />
        </Card>
      )}

      {/* 目标列表 */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">目标列表</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                新建目标
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGoal ? '编辑目标' : '新建目标'}</DialogTitle>
                <DialogDescription>
                  {editingGoal ? '修改写作目标' : '创建一个新的写作目标'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">目标标题 *</Label>
                  <Input
                    id="title"
                    placeholder="如：每日3000字"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWords">目标字数 *</Label>
                  <Input
                    id="targetWords"
                    type="number"
                    placeholder="如：3000"
                    value={formData.targetWords || ''}
                    onChange={(e) => setFormData({ ...formData, targetWords: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">周期</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value: WritingGoal['period']) =>
                      setFormData({ ...formData, period: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">每日目标</SelectItem>
                      <SelectItem value="weekly">每周目标</SelectItem>
                      <SelectItem value="monthly">每月目标</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  取消
                </Button>
                <Button onClick={handleSave}>{editingGoal ? '保存' : '创建'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {goals.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <Target className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg mb-2">暂无写作目标</p>
            <p className="text-sm">设置写作目标，保持创作动力</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{goal.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{getPeriodText(goal.period)}</span>
                      {goal.streakDays > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-orange-500 flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            {goal.streakDays}天
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(goal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {goal.currentWords.toLocaleString()} / {goal.targetWords.toLocaleString()} 字
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {getProgressPercent(goal.currentWords, goal.targetWords)}%
                    </span>
                  </div>
                  <Progress
                    value={getProgressPercent(goal.currentWords, goal.targetWords)}
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>创建于 {formatDate(goal.startDate)}</span>
                  {getProgressPercent(goal.currentWords, goal.targetWords) >= 100 && (
                    <span className="text-green-500 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      已完成
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
