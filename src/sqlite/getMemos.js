'use server'

import { getDatabase } from '../database/database'

/**
 * 全てのメモを取得するServer Action
 * ブラウザから直接呼び出せる
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
    const memos = db.prepare('SELECT * FROM memo ORDER BY id DESC').all()
    return memos
  } catch (error) {
    console.error('メモの取得に失敗しました:', error)
    return []
  }
}
