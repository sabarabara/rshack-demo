import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'

// データベースインスタンスを保持する変数（サーバー起動中は同じものを使い続ける）
let db = null

/**
 * データベースを取得する関数
 * 初回呼び出し時にDBファイルを作成し、memoテーブルを生成する
 * @returns {DatabaseSync|null} データベースインスタンス（失敗時はnull）
 */
export function getDatabase() {
  // すでに初期化済みなら同じインスタンスを返す
  if (db) {
    return db
  }

  try {
    // dataディレクトリを自動作成（ない場合のみ）
    const dataDir = path.join(process.cwd(), 'data')
    fs.mkdirSync(dataDir, { recursive: true })

    // DBファイルのパスを指定してデータベースを開く
    const dbPath = path.join(dataDir, 'memo.db')
    db = new DatabaseSync(dbPath)
    console.log('データベースを開きました:', dbPath)

    // memoテーブルを作成
    createMemoTable()

    return db
  } catch (error) {
    console.error('データベースの初期化に失敗しました:', error)
    return null
  }
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
  db.exec(sql)
  console.log('memoテーブルを作成しました')
}
