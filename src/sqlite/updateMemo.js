import { getDatabase, saveDatabase } from '../database/database'

/**
 * メモを更新する関数
 * @param {number} id - メモのID
 * @param {string} title - 新しいタイトル
 * @param {string} content - 新しい内容
 * @returns {boolean} 成功したかどうか
 */
export function updateMemo(id, title, content) {
  const db = getDatabase()
  if (!db) {
    console.error('データベースが利用できません')
    return false
  }

  // 入力値のバリデーション
  if (!id || !title || !content) {
    console.error('ID、タイトル、内容は必須です')
    return false
  }

  try {
    // プリペアドステートメントでSQLインジェクションを防ぐ
    const sql = 'UPDATE memo SET title = ?, content = ? WHERE id = ?'
    db.run(sql, [title, content, id])

    // データベースをLocalStorageに保存
    saveDatabase()
    console.log('メモを更新しました:', id)
    return true
  } catch (error) {
    console.error('メモの更新に失敗しました:', error)
    return false
  }
}
