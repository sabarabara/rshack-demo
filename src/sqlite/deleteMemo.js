'use server'

import { getDatabase } from '../database/database'

/**
 * メモを削除するServer Action
 * @param {number} id - メモのID
 * @returns {Promise<boolean>} 成功したかどうか
 */
export async function deleteMemo(id) {
  const db = getDatabase()
  if (!db) {
    console.error('データベースが利用できません')
    return false
  }

  // 入力値のバリデーション
  if (!id) {
    console.error('IDは必須です')
    return false
  }

  try {
    // プリペアドステートメントでSQLインジェクションを防ぐ
    const sql = 'DELETE FROM memo WHERE id = ?'
    db.prepare(sql).run(id)

    console.log('メモを削除しました:', id)
    return true
  } catch (error) {
    console.error('メモの削除に失敗しました:', error)
    return false
  }
}
