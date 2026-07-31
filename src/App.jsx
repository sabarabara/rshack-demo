'use client'

import { useState } from 'react'
import MemoForm from './components/MemoForm'
import MemoList from './components/MemoList'
import { getMemos } from './sqlite/getMemos'
import { createMemo } from './sqlite/createMemo'
import { updateMemo } from './sqlite/updateMemo'
import { deleteMemo } from './sqlite/deleteMemo'

// メモアプリのメインコンポーネント（Client Component）
function App({ initialMemos = [] }) {
  // メモの一覧を管理（初期値はサーバーから受け取ったデータ）
  const [memos, setMemos] = useState(initialMemos)

  // エラーメッセージを管理
  const [error, setError] = useState('')

  /**
   * メモ一覧を読み込む関数
   * Server Action（getMemos）を呼び出して最新のデータを取得する
   */
  const loadMemos = async () => {
    const allMemos = await getMemos()
    setMemos(allMemos)
  }

  /**
   * メモを追加する関数
   * @param {string} title - メモのタイトル
   * @param {string} content - メモの内容
   */
  const handleAddMemo = async (title, content) => {
    const success = await createMemo(title, content)
    if (success) {
      // 追加後に一覧を再読み込み
      await loadMemos()
    } else {
      setError('メモの追加に失敗しました')
    }
  }

  /**
   * メモを更新する関数
   * @param {number} id - メモのID
   * @param {string} title - 新しいタイトル
   * @param {string} content - 新しい内容
   */
  const handleEditMemo = async (id, title, content) => {
    const success = await updateMemo(id, title, content)
    if (success) {
      // 更新後に一覧を再読み込み
      await loadMemos()
    } else {
      setError('メモの更新に失敗しました')
    }
  }

  /**
   * メモを削除する関数
   * @param {number} id - メモのID
   */
  const handleDeleteMemo = async (id) => {
    const success = await deleteMemo(id)
    if (success) {
      // 削除後に一覧を再読み込み
      await loadMemos()
    } else {
      setError('メモの削除に失敗しました')
    }
  }

  return (
    <div className="app">
      <h1>メモアプリ</h1>

      {/* エラーメッセージの表示 */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')}>閉じる</button>
        </div>
      )}

      {/* メモ入力フォーム */}
      <MemoForm onAddMemo={handleAddMemo} />

      {/* メモ一覧 */}
      <MemoList
        memos={memos}
        onEditMemo={handleEditMemo}
        onDeleteMemo={handleDeleteMemo}
      />
    </div>
  )
}

export default App
