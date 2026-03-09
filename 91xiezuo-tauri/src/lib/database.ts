import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null

// 数据库初始化
export async function initDatabase(): Promise<void> {
  if (db) return

  try {
    db = await Database.load('sqlite:noveldb.db')
    
    // 创建小说表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS novels (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT,
        description TEXT,
        cover TEXT,
        genre TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        word_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // 创建章节表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS chapters (
        id TEXT PRIMARY KEY,
        novel_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        order_num INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        word_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_generated INTEGER DEFAULT 0,
        FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
      )
    `)

    // 创建提示词表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS prompts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // 创建写作目标表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS writing_goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        target_words INTEGER NOT NULL,
        current_words INTEGER DEFAULT 0,
        period TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        streak_days INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `)

    // 创建短文表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS short_stories (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        genre TEXT,
        word_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // 创建拆书分析表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS book_analyses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT,
        summary TEXT,
        structure TEXT,
        themes TEXT,
        characters TEXT,
        writing_style TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `)

    // 创建类型表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS genres (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        is_popular INTEGER DEFAULT 0,
        count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `)

    // 创建工具表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        prompt TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `)

    // 创建计费记录表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS billing_records (
        id TEXT PRIMARY KEY,
        model TEXT NOT NULL,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        cost REAL DEFAULT 0,
        status TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        error TEXT
      )
    `)

    // 创建设置表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // 创建索引以提高查询性能
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON chapters(novel_id)`)
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_billing_records_timestamp ON billing_records(timestamp)`)
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_short_stories_genre ON short_stories(genre)`)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// 获取数据库实例
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

// 关闭数据库连接
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close()
    db = null
  }
}

// 重置数据库（慎用）
export async function resetDatabase(): Promise<void> {
  if (!db) return
  
  const tables = [
    'novels', 'chapters', 'prompts', 'writing_goals',
    'short_stories', 'book_analyses', 'genres', 'tools',
    'billing_records', 'settings'
  ]
  
  for (const table of tables) {
    await db.execute(`DROP TABLE IF EXISTS ${table}`)
  }
  
  await initDatabase()
}
