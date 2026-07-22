import { getDatabase } from '../database/database'

/**
 * 全てのメモを取得する関数
 * @returns {Array} メモの配列
 */
export function getMemos() {
  const db = getDatabase()
  if (!db) {
    console.error('データベースが利用できません')
    return []
  }

  try {
    // SQLで全メモを取得（新しい順にソート）
    const result = db.exec('SELECT * FROM memo ORDER BY id DESC')

    // 結果が空の場合は空配列を返す
    if (result.length === 0) {
      return []
    }

    // sql.jsの結果形式をオブジェクト配列に変換
    const columns = result[0].columns
    const values = result[0].values

    const memos = values.map(row => {
      const memo = {}
      columns.forEach((col, index) => {
        memo[col] = row[index]
      })
      return memo
    })

    return memos
  } catch (error) {
    console.error('メモの取得に失敗しました:', error)
    return []
  }
}
