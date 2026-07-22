import initSqlJs from 'sql.js'

// sql.jsのWebAssemblyバイト列を保存する変数
let SQL = null

// データベースインスタンスを保持する変数
let db = null

// LocalStorageのキー名
const DB_STORAGE_KEY = 'memo-database'

/**
 * データベースを初期化する関数
 * sql.jsを読み込み、既存のデータベースがある場合は復元する
 * ない場合は新しいデータベースを作成する
 */
export async function initDatabase() {
  // sql.jsの初期化（WebAssemblyを読み込む）
  SQL = await initSqlJs()

  // LocalStorageから既存のデータベースを復元
  const savedData = localStorage.getItem(DB_STORAGE_KEY)

  if (savedData) {
    try {
      // 保存されたデータがある場合は復元
      const uintArray = new Uint8Array(JSON.parse(savedData))
      db = new SQL.Database(uintArray)
      console.log('データベースをLocalStorageから復元しました')
    } catch (error) {
      // LocalStorageのデータが壊れている場合は新規作成
      console.error('LocalStorageのデータが壊れています。新規データベースを作成します:', error)
      localStorage.removeItem(DB_STORAGE_KEY)
      db = new SQL.Database()
    }
  } else {
    // 新しいデータベースを作成
    db = new SQL.Database()
    console.log('新しいデータベースを作成しました')
  }

  // テーブルを作成（IF NOT EXISTSで既存テーブルを保護）
  createMemoTable()

  return db
}

/**
 * memoテーブルを作成する関数
 */
function createMemoTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS memo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `
  db.run(sql)
  console.log('memoテーブルを作成しました')
}

/**
 * データベースをLocalStorageに保存する関数
 */
export function saveDatabase() {
  if (!db) {
    console.error('データベースが初期化されていません')
    return
  }

  // データベースのバイナリデータを取得
  const data = db.export()
  // Uint8ArrayをJSON保存可能な形式に変換
  const jsonArray = Array.from(data)
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(jsonArray))
  console.log('データベースをLocalStorageに保存しました')
}

/**
 * データベースインスタンスを取得する関数
 */
export function getDatabase() {
  if (!db) {
    console.error('データベースが初期化されていません')
    return null
  }
  return db
}
