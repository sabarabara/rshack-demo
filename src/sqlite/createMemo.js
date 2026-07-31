'use server'

import { getDatabase } from '../database/database'

/**
 * 新しいメモを追加するServer Action
 * @param {string} title - メモのタイトル
 * @param {string} content - メモの内容
 * @returns {Promise<boolean>} 成功したかどうか
 */
export async function createMemo(title, content) {
  const db = getDatabase()
  if (!db) {
    console.error('データベースが利用できません')
    return false
  }

  // 入力値のバリデーション
  if (!title || !content) {
    console.error('タイトルと内容は必須です')
    return false
  }

  try {
    // 現在の日時を取得（ISO形式）
    const createdAt = new Date().toISOString()

    // プリペアドステートメントでSQLインジェクションを防ぐ
    const sql = 'INSERT INTO memo (title, content, created_at) VALUES (?, ?, ?)'
    db.prepare(sql).run(title, content, createdAt)

    console.log('メモを追加しました:', title)
    return true
  } catch (error) {
    console.error('メモの追加に失敗しました:', error)
    return false
  }
}
