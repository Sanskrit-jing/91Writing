import { initDatabase, getDatabase } from './database'
import type { Novel, Chapter, Prompt, WritingGoal, ShortStory, BookAnalysis } from '@/types'

// 从 LocalStorage 迁移数据到 SQLite
export async function migrateFromLocalStorage() {
  console.log('Starting migration from LocalStorage to SQLite...')

  try {
    // 初始化数据库
    await initDatabase()
    const db = getDatabase()

    // 迁移小说
    const novelsData = localStorage.getItem('novels')
    if (novelsData) {
      const novels: Novel[] = JSON.parse(novelsData)
      for (const novel of novels) {
        try {
          await db.execute(
            `INSERT INTO novels (id, title, author, description, cover, genre, status, word_count, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
             title=excluded.title, author=excluded.author, description=excluded.description,
             cover=excluded.cover, genre=excluded.genre, status=excluded.status,
             word_count=excluded.word_count, updated_at=excluded.updated_at`,
            [
              novel.id,
              novel.title,
              novel.author || null,
              novel.description || null,
              novel.cover || null,
              novel.genre || null,
              novel.status,
              novel.wordCount,
              novel.createdAt,
              novel.updatedAt,
            ]
          )
          console.log(`Migrated novel: ${novel.title}`)
        } catch (error) {
          console.error(`Failed to migrate novel ${novel.id}:`, error)
        }
      }
    }

    // 迁移章节
    const chaptersData = localStorage.getItem('chapters')
    if (chaptersData) {
      const chapters: Chapter[] = JSON.parse(chaptersData)
      for (const chapter of chapters) {
        try {
          await db.execute(
            `INSERT INTO chapters (id, novel_id, title, content, order_num, status, word_count, created_at, updated_at, is_generated)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
             title=excluded.title, content=excluded.content, order_num=excluded.order_num,
             status=excluded.status, word_count=excluded.word_count, updated_at=excluded.updated_at`,
            [
              chapter.id,
              chapter.novelId,
              chapter.title,
              chapter.content,
              chapter.order,
              chapter.status,
              chapter.wordCount,
              chapter.createdAt,
              chapter.updatedAt,
              chapter.isGenerated ? 1 : 0,
            ]
          )
          console.log(`Migrated chapter: ${chapter.title}`)
        } catch (error) {
          console.error(`Failed to migrate chapter ${chapter.id}:`, error)
        }
      }
    }

    // 迁移提示词
    const promptsData = localStorage.getItem('prompts')
    if (promptsData) {
      const prompts: Prompt[] = JSON.parse(promptsData)
      for (const prompt of prompts) {
        try {
          await db.execute(
            `INSERT INTO prompts (id, name, content, category, tags, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
             name=excluded.name, content=excluded.content, category=excluded.category,
             tags=excluded.tags, updated_at=excluded.updated_at`,
            [
              prompt.id,
              prompt.name,
              prompt.content,
              prompt.category,
              JSON.stringify(prompt.tags),
              prompt.createdAt,
              prompt.updatedAt,
            ]
          )
          console.log(`Migrated prompt: ${prompt.name}`)
        } catch (error) {
          console.error(`Failed to migrate prompt ${prompt.id}:`, error)
        }
      }
    }

    // 迁移写作目标
    const goalsData = localStorage.getItem('writingGoals')
    if (goalsData) {
      const goals: WritingGoal[] = JSON.parse(goalsData)
      for (const goal of goals) {
        try {
          await db.execute(
            `INSERT INTO writing_goals (id, title, target_words, current_words, period, start_date, end_date, streak_days, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
             title=excluded.title, target_words=excluded.target_words, current_words=excluded.current_words,
             period=excluded.period, start_date=excluded.start_date, end_date=excluded.end_date,
             streak_days=excluded.streak_days`,
            [
              goal.id,
              goal.title,
              goal.targetWords,
              goal.currentWords,
              goal.period,
              goal.startDate,
              goal.endDate || null,
              goal.streakDays,
              goal.createdAt,
            ]
          )
          console.log(`Migrated goal: ${goal.title}`)
        } catch (error) {
          console.error(`Failed to migrate goal ${goal.id}:`, error)
        }
      }
    }

    // 迁移短文
    const storiesData = localStorage.getItem('shortStories')
    if (storiesData) {
      const stories: ShortStory[] = JSON.parse(storiesData)
      for (const story of stories) {
        try {
          await db.execute(
            `INSERT INTO short_stories (id, title, content, genre, word_count, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
             title=excluded.title, content=excluded.content, genre=excluded.genre,
             word_count=excluded.word_count, updated_at=excluded.updated_at`,
            [
              story.id,
              story.title,
              story.content,
              story.genre || null,
              story.wordCount,
              story.createdAt,
              story.updatedAt,
            ]
          )
          console.log(`Migrated short story: ${story.title}`)
        } catch (error) {
          console.error(`Failed to migrate short story ${story.id}:`, error)
        }
      }
    }

    // 迁移拆书分析
    const analysesData = localStorage.getItem('bookAnalyses')
    if (analysesData) {
      const analyses: BookAnalysis[] = JSON.parse(analysesData)
      for (const analysis of analyses) {
        try {
          await db.execute(
            `INSERT INTO book_analyses (id, title, author, summary, structure, themes, characters, writing_style, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
             title=excluded.title, author=excluded.author, summary=excluded.summary,
             structure=excluded.structure, themes=excluded.themes, characters=excluded.characters,
             writing_style=excluded.writing_style`,
            [
              analysis.id,
              analysis.title,
              analysis.author || null,
              analysis.summary || null,
              analysis.structure || null,
              JSON.stringify(analysis.themes),
              JSON.stringify(analysis.characters),
              analysis.writingStyle,
              analysis.createdAt,
            ]
          )
          console.log(`Migrated analysis: ${analysis.title}`)
        } catch (error) {
          console.error(`Failed to migrate analysis ${analysis.id}:`, error)
        }
      }
    }

    // 迁移设置
    const settingsData = localStorage.getItem('appSettings')
    if (settingsData) {
      const settings = JSON.parse(settingsData)
      for (const [key, value] of Object.entries(settings)) {
        try {
          await db.execute(
            `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
             ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`,
            [key, String(value), new Date().toISOString()]
          )
          console.log(`Migrated setting: ${key}`)
        } catch (error) {
          console.error(`Failed to migrate setting ${key}:`, error)
        }
      }
    }

    console.log('Migration completed successfully!')
    
    // 询问是否清除 LocalStorage
    const shouldClear = confirm(
      '数据迁移成功！是否清除 LocalStorage 中的旧数据？\n\n' +
      '建议清除以节省存储空间，但建议先备份数据。'
    )
    
    if (shouldClear) {
      localStorage.clear()
      console.log('LocalStorage cleared')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// 检查是否需要迁移
export function shouldMigrate(): boolean {
  const hasLocalStorage = !!localStorage.getItem('novels') || 
                          !!localStorage.getItem('chapters') ||
                          !!localStorage.getItem('prompts')
  return hasLocalStorage
}
