import { getDatabase } from '../database/database'

/**
 * 全てのメモを取得するDB関数
 * Route Handler（app/api/memos/route.js）から呼び出される
 * @returns {Promise<Array>} メモの配列
 */
export async function getMemos() {
  const db = getDatabase()
  if (!db) {
    console.error('データベースが利用できません')
    return []
  }

  try {
    // SQLで全メモを取得（新しい順にソート）
    const rows = db.prepare('SELECT * FROM memo ORDER BY id DESC').all()

    // node:sqliteの結果は特別なオブジェクトのため、通常のオブジェクトに変換して返す
    // （そのまま返すとNext.jsの画面表示でエラーになる）
    const memos = rows.map((memo) => ({ ...memo }))
    return memos
  } catch (error) {
    console.error('メモの取得に失敗しました:', error)
    return []
  }
}
