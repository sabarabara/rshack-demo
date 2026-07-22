import { getDatabase, saveDatabase } from '../database/database'

/**
 * メモを削除する関数
 * @param {number} id - メモのID
 * @returns {boolean} 成功したかどうか
 * @throws {Error} データベース操作に失敗した場合
 */
export function deleteMemo(id) {
  const db = getDatabase()
  if (!db) {
    throw new Error('データベースが利用できません')
  }

  // 入力値のバリデーション
  if (!id) {
    throw new Error('IDは必須です')
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
    throw new Error('メモの削除に失敗しました: ' + error.message)
  }
}
