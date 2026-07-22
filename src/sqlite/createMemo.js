import { getDatabase, saveDatabase } from '../database/database'

/**
 * 新しいメモを追加する関数
 * @param {string} title - メモのタイトル
 * @param {string} content - メモの内容
 * @returns {boolean} 成功したかどうか
 * @throws {Error} データベース操作に失敗した場合
 */
export function createMemo(title, content) {
  const db = getDatabase()
  if (!db) {
    throw new Error('データベースが利用できません')
  }

  // 入力値のバリデーション
  if (!title || !content) {
    throw new Error('タイトルと内容は必須です')
  }

  try {
    // 現在の日時を取得（ISO形式）
    const createdAt = new Date().toISOString()

    // プリペアドステートメントでSQLインジェクションを防ぐ
    const sql = 'INSERT INTO memo (title, content, created_at) VALUES (?, ?, ?)'
    db.run(sql, [title, content, createdAt])

    // データベースをLocalStorageに保存
    saveDatabase()
    console.log('メモを追加しました:', title)
    return true
  } catch (error) {
    console.error('メモの追加に失敗しました:', error)
    throw new Error('メモの追加に失敗しました: ' + error.message)
  }
}
