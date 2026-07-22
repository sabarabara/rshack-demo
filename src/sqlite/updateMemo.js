import { getDatabase, saveDatabase } from '../database/database'

/**
 * メモを更新する関数
 * @param {number} id - メモのID
 * @param {string} title - 新しいタイトル
 * @param {string} content - 新しい内容
 * @returns {boolean} 成功したかどうか
 * @throws {Error} データベース操作に失敗した場合
 */
export function updateMemo(id, title, content) {
  const db = getDatabase()
  if (!db) {
    throw new Error('データベースが利用できません')
  }

  // 入力値のバリデーション
  if (!id || !title || !content) {
    throw new Error('ID、タイトル、内容は必須です')
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
    throw new Error('メモの更新に失敗しました: ' + error.message)
  }
}
