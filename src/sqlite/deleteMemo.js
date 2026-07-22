import { getDatabase, saveDatabase } from '../database/database'

/**
 * メモを削除する関数
 * @param {number} id - メモのID
 * @returns {boolean} 成功したかどうか
 */
export function deleteMemo(id) {
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
    db.run(sql, [id])

    // データベースをLocalStorageに保存
    saveDatabase()
    console.log('メモを削除しました:', id)
    return true
  } catch (error) {
    console.error('メモの削除に失敗しました:', error)
    return false
  }
}
