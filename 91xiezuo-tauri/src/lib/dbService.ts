import Database from '@tauri-apps/plugin-sql'
import { getDatabase } from './database'
import type { Novel, Chapter, Prompt, WritingGoal, ShortStory, BookAnalysis, BillingRecord } from '@/types'

// ==================== 小说相关操作 ====================

export async function getAllNovels(): Promise<Novel[]> {
  const db = getDatabase()
  const result = await db.select('SELECT * FROM novels ORDER BY updated_at DESC')
  return result.map(row => ({
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description,
    cover: row.cover,
    genre: row.genre,
    status: row.status,
    wordCount: row.word_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function getNovelById(id: string): Promise<Novel | null> {
  const db = getDatabase()
  const result = await db.select('SELECT * FROM novels WHERE id = ?', [id])
  
  if (result.length === 0) return null
  
  const row = result[0]
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description,
    cover: row.cover,
    genre: row.genre,
    status: row.status,
    wordCount: row.word_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function createNovel(novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Novel> {
  const db = getDatabase()
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const newNovel: Novel = {
    ...novel,
    id,
    createdAt: now,
    updatedAt: now,
  }
  
  await db.execute(
    `INSERT INTO novels (id, title, author, description, cover, genre, status, word_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      newNovel.title,
      newNovel.author || null,
      newNovel.description || null,
      newNovel.cover || null,
      newNovel.genre || null,
      newNovel.status,
      newNovel.wordCount,
      now,
      now,
    ]
  )
  
  return newNovel
}

export async function updateNovel(id: string, novel: Partial<Novel>): Promise<void> {
  const db = getDatabase()
  const updates: string[] = []
  const values: any[] = []
  
  if (novel.title !== undefined) {
    updates.push('title = ?')
    values.push(novel.title)
  }
  if (novel.author !== undefined) {
    updates.push('author = ?')
    values.push(novel.author)
  }
  if (novel.description !== undefined) {
    updates.push('description = ?')
    values.push(novel.description)
  }
  if (novel.genre !== undefined) {
    updates.push('genre = ?')
    values.push(novel.genre)
  }
  if (novel.status !== undefined) {
    updates.push('status = ?')
    values.push(novel.status)
  }
  if (novel.wordCount !== undefined) {
    updates.push('word_count = ?')
    values.push(novel.wordCount)
  }
  
  updates.push('updated_at = ?')
  values.push(new Date().toISOString())
  values.push(id)
  
  await db.execute(`UPDATE novels SET ${updates.join(', ')} WHERE id = ?`, values)
}

export async function deleteNovel(id: string): Promise<void> {
  const db = getDatabase()
  await db.execute('DELETE FROM novels WHERE id = ?', [id])
  // 级联删除章节会自动执行
}

// ==================== 章节相关操作 ====================

export async function getChaptersByNovelId(novelId: string): Promise<Chapter[]> {
  const db = getDatabase()
  const result = await db.select(
    'SELECT * FROM chapters WHERE novel_id = ? ORDER BY order_num ASC',
    [novelId]
  )
  
  return result.map(row => ({
    id: row.id,
    novelId: row.novel_id,
    title: row.title,
    content: row.content || '',
    order: row.order_num,
    status: row.status,
    wordCount: row.word_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isGenerated: row.is_generated === 1,
  }))
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  const db = getDatabase()
  const result = await db.select('SELECT * FROM chapters WHERE id = ?', [id])
  
  if (result.length === 0) return null
  
  const row = result[0]
  return {
    id: row.id,
    novelId: row.novel_id,
    title: row.title,
    content: row.content || '',
    order: row.order_num,
    status: row.status,
    wordCount: row.word_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isGenerated: row.is_generated === 1,
  }
}

export async function createChapter(chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chapter> {
  const db = getDatabase()
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const newChapter: Chapter = {
    ...chapter,
    id,
    createdAt: now,
    updatedAt: now,
  }
  
  await db.execute(
    `INSERT INTO chapters (id, novel_id, title, content, order_num, status, word_count, created_at, updated_at, is_generated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      newChapter.novelId,
      newChapter.title,
      newChapter.content || '',
      newChapter.order,
      newChapter.status,
      newChapter.wordCount,
      now,
      now,
      newChapter.isGenerated ? 1 : 0,
    ]
  )
  
  return newChapter
}

export async function updateChapter(id: string, chapter: Partial<Chapter>): Promise<void> {
  const db = getDatabase()
  const updates: string[] = []
  const values: any[] = []
  
  if (chapter.title !== undefined) {
    updates.push('title = ?')
    values.push(chapter.title)
  }
  if (chapter.content !== undefined) {
    updates.push('content = ?')
    values.push(chapter.content)
  }
  if (chapter.order !== undefined) {
    updates.push('order_num = ?')
    values.push(chapter.order)
  }
  if (chapter.status !== undefined) {
    updates.push('status = ?')
    values.push(chapter.status)
  }
  if (chapter.wordCount !== undefined) {
    updates.push('word_count = ?')
    values.push(chapter.wordCount)
  }
  if (chapter.isGenerated !== undefined) {
    updates.push('is_generated = ?')
    values.push(chapter.isGenerated ? 1 : 0)
  }
  
  updates.push('updated_at = ?')
  values.push(new Date().toISOString())
  values.push(id)
  
  await db.execute(`UPDATE chapters SET ${updates.join(', ')} WHERE id = ?`, values)
}

export async function deleteChapter(id: string): Promise<void> {
  const db = getDatabase()
  await db.execute('DELETE FROM chapters WHERE id = ?', [id])
}

// ==================== 提示词相关操作 ====================

export async function getAllPrompts(): Promise<Prompt[]> {
  const db = getDatabase()
  const result = await db.select('SELECT * FROM prompts ORDER BY updated_at DESC')
  return result.map(row => ({
    id: row.id,
    name: row.name,
    content: row.content,
    category: row.category,
    tags: row.tags ? JSON.parse(row.tags) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function createPrompt(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prompt> {
  const db = getDatabase()
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const newPrompt: Prompt = {
    ...prompt,
    id,
    createdAt: now,
    updatedAt: now,
  }
  
  await db.execute(
    `INSERT INTO prompts (id, name, content, category, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      newPrompt.name,
      newPrompt.content,
      newPrompt.category,
      JSON.stringify(newPrompt.tags),
      now,
      now,
    ]
  )
  
  return newPrompt
}

export async function updatePrompt(id: string, prompt: Partial<Prompt>): Promise<void> {
  const db = getDatabase()
  const updates: string[] = []
  const values: any[] = []
  
  if (prompt.name !== undefined) {
    updates.push('name = ?')
    values.push(prompt.name)
  }
  if (prompt.content !== undefined) {
    updates.push('content = ?')
    values.push(prompt.content)
  }
  if (prompt.category !== undefined) {
    updates.push('category = ?')
    values.push(prompt.category)
  }
  if (prompt.tags !== undefined) {
    updates.push('tags = ?')
    values.push(JSON.stringify(prompt.tags))
  }
  
  updates.push('updated_at = ?')
  values.push(new Date().toISOString())
  values.push(id)
  
  await db.execute(`UPDATE prompts SET ${updates.join(', ')} WHERE id = ?`, values)
}

export async function deletePrompt(id: string): Promise<void> {
  const db = getDatabase()
  await db.execute('DELETE FROM prompts WHERE id = ?', [id])
}

// ==================== 写作目标相关操作 ====================

export async function getAllWritingGoals(): Promise<WritingGoal[]> {
  const db = getDatabase()
  const result = await db.select('SELECT * FROM writing_goals ORDER BY created_at DESC')
  return result.map(row => ({
    id: row.id,
    title: row.title,
    targetWords: row.target_words,
    currentWords: row.current_words,
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
    streakDays: row.streak_days,
    createdAt: row.created_at,
  }))
}

export async function createWritingGoal(goal: Omit<WritingGoal, 'id' | 'createdAt'>): Promise<WritingGoal> {
  const db = getDatabase()
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const newGoal: WritingGoal = {
    ...goal,
    id,
    createdAt: now,
  }
  
  await db.execute(
    `INSERT INTO writing_goals (id, title, target_words, current_words, period, start_date, end_date, streak_days, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      newGoal.title,
      newGoal.targetWords,
      newGoal.currentWords,
      newGoal.period,
      newGoal.startDate,
      newGoal.endDate || null,
      newGoal.streakDays,
      now,
    ]
  )
  
  return newGoal
}

export async function updateWritingGoal(id: string, goal: Partial<WritingGoal>): Promise<void> {
  const db = getDatabase()
  const updates: string[] = []
  const values: any[] = []
  
  if (goal.title !== undefined) {
    updates.push('title = ?')
    values.push(goal.title)
  }
  if (goal.targetWords !== undefined) {
    updates.push('target_words = ?')
    values.push(goal.targetWords)
  }
  if (goal.currentWords !== undefined) {
    updates.push('current_words = ?')
    values.push(goal.currentWords)
  }
  if (goal.period !== undefined) {
    updates.push('period = ?')
    values.push(goal.period)
  }
  if (goal.endDate !== undefined) {
    updates.push('end_date = ?')
    values.push(goal.endDate)
  }
  if (goal.streakDays !== undefined) {
    updates.push('streak_days = ?')
    values.push(goal.streakDays)
  }
  
  values.push(id)
  
  await db.execute(`UPDATE writing_goals SET ${updates.join(', ')} WHERE id = ?`, values)
}

export async function deleteWritingGoal(id: string): Promise<void> {
  const db = getDatabase()
  await db.execute('DELETE FROM writing_goals WHERE id = ?', [id])
}

// ==================== 短文相关操作 ====================

export async function getAllShortStories(): Promise<ShortStory[]> {
  const db = getDatabase()
  const result = await db.select('SELECT * FROM short_stories ORDER BY updated_at DESC')
  return result.map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    genre: row.genre,
    wordCount: row.word_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function createShortStory(story: Omit<ShortStory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShortStory> {
  const db = getDatabase()
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const newStory: ShortStory = {
    ...story,
    id,
    createdAt: now,
    updatedAt: now,
  }
  
  await db.execute(
    `INSERT INTO short_stories (id, title, content, genre, word_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      newStory.title,
      newStory.content,
      newStory.genre || null,
      newStory.wordCount,
      now,
      now,
    ]
  )
  
  return newStory
}

export async function deleteShortStory(id: string): Promise<void> {
  const db = getDatabase()
  await db.execute('DELETE FROM short_stories WHERE id = ?', [id])
}

// ==================== 拆书分析相关操作 ====================

export async function getAllBookAnalyses(): Promise<BookAnalysis[]> {
  const db = getDatabase()
  const result = await db.select('SELECT * FROM book_analyses ORDER BY created_at DESC')
  return result.map(row => ({
    id: row.id,
    title: row.title,
    author: row.author,
    summary: row.summary || '',
    structure: row.structure || '',
    themes: row.themes ? JSON.parse(row.themes) : [],
    characters: row.characters ? JSON.parse(row.characters) : [],
    writingStyle: row.writing_style,
    createdAt: row.created_at,
  }))
}

export async function createBookAnalysis(analysis: Omit<BookAnalysis, 'id' | 'createdAt'>): Promise<BookAnalysis> {
  const db = getDatabase()
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const newAnalysis: BookAnalysis = {
    ...analysis,
    id,
    createdAt: now,
  }
  
  await db.execute(
    `INSERT INTO book_analyses (id, title, author, summary, structure, themes, characters, writing_style, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      newAnalysis.title,
      newAnalysis.author || null,
      newAnalysis.summary || null,
      newAnalysis.structure || null,
      JSON.stringify(newAnalysis.themes),
      JSON.stringify(newAnalysis.characters),
      newAnalysis.writingStyle,
      now,
    ]
  )
  
  return newAnalysis
}

export async function deleteBookAnalysis(id: string): Promise<void> {
  const db = getDatabase()
  await db.execute('DELETE FROM book_analyses WHERE id = ?', [id])
}

// ==================== 计费记录相关操作 ====================

export async function getBillingRecords(limit: number = 100): Promise<BillingRecord[]> {
  const db = getDatabase()
  const result = await db.select(
    'SELECT * FROM billing_records ORDER BY timestamp DESC LIMIT ?',
    [limit]
  )
  return result.map(row => ({
    id: row.id,
    model: row.model,
    inputTokens: row.input_tokens,
    outputTokens: row.output_tokens,
    totalTokens: row.total_tokens,
    cost: row.cost,
    status: row.status,
    timestamp: row.timestamp,
    error: row.error,
  }))
}

export async function createBillingRecord(record: Omit<BillingRecord, 'id'>): Promise<void> {
  const db = getDatabase()
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  await db.execute(
    `INSERT INTO billing_records (id, model, input_tokens, output_tokens, total_tokens, cost, status, timestamp, error)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      record.model,
      record.inputTokens,
      record.outputTokens,
      record.totalTokens,
      record.cost,
      record.status,
      record.timestamp,
      record.error || null,
    ]
  )
}

export async function deleteBillingRecord(id: string): Promise<void> {
  const db = getDatabase()
  await db.execute('DELETE FROM billing_records WHERE id = ?', [id])
}

// ==================== 设置相关操作 ====================

export async function getSetting(key: string): Promise<string | null> {
  const db = getDatabase()
  const result = await db.select('SELECT value FROM settings WHERE key = ?', [key])
  return result.length > 0 ? result[0].value : null
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDatabase()
  const now = new Date().toISOString()
  
  await db.execute(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?`,
    [key, value, now, value, now]
  )
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const db = getDatabase()
  const result = await db.select('SELECT * FROM settings')
  const settings: Record<string, string> = {}
  result.forEach(row => {
    settings[row.key] = row.value
  })
  return settings
}

export async function deleteSetting(key: string): Promise<void> {
  const db = getDatabase()
  await db.execute('DELETE FROM settings WHERE key = ?', [key])
}
