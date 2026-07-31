'use client'

import { useState, useEffect } from 'react'
import MemoForm from './components/MemoForm'
import MemoList from './components/MemoList'

// メモアプリのメインコンポーネント（Client Component）
function App() {
  // メモの一覧を管理
  const [memos, setMemos] = useState([])

  // 読み込み中かどうかを管理
  const [isLoading, setIsLoading] = useState(true)

  // エラーメッセージを管理
  const [error, setError] = useState('')

  // コンポーネントが表示されたときにメモ一覧を取得する
  useEffect(() => {
    loadMemos()
  }, [])

  /**
   * メモ一覧を読み込む関数
   * GET /api/memos を呼び出して最新のデータを取得する
   */
  const loadMemos = async () => {
    try {
      // メモ一覧を取得するAPIを呼び出し
      const response = await fetch('/api/memos')
      const data = await response.json()

      // エラーレスポンスなら例外を発生させる
      if (!response.ok) {
        throw new Error(data.error || 'メモの取得に失敗しました')
      }

      setMemos(data)
    } catch (err) {
      console.error('メモの取得に失敗しました:', err)
      setError(err.message || 'メモの取得に失敗しました')
    } finally {
      // 読み込み完了（成功・失敗どちらでも）
      setIsLoading(false)
    }
  }

  /**
   * メモを追加する関数
   * @param {string} title - メモのタイトル
   * @param {string} content - メモの内容
   */
  const handleAddMemo = async (title, content) => {
    try {
      // メモを追加するAPIを呼び出し
      const response = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      const data = await response.json()

      // エラーレスポンスなら例外を発生させる
      if (!response.ok) {
        throw new Error(data.error || 'メモの追加に失敗しました')
      }

      // 追加後に一覧を再読み込み
      await loadMemos()
    } catch (err) {
      console.error('メモの追加に失敗しました:', err)
      setError(err.message || 'メモの追加に失敗しました')
    }
  }

  /**
   * メモを更新する関数
   * @param {number} id - メモのID
   * @param {string} title - 新しいタイトル
   * @param {string} content - 新しい内容
   */
  const handleEditMemo = async (id, title, content) => {
    try {
      // メモを更新するAPIを呼び出し
      const response = await fetch(`/api/memos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      const data = await response.json()

      // エラーレスポンスなら例外を発生させる
      if (!response.ok) {
        throw new Error(data.error || 'メモの更新に失敗しました')
      }

      // 更新後に一覧を再読み込み
      await loadMemos()
    } catch (err) {
      console.error('メモの更新に失敗しました:', err)
      setError(err.message || 'メモの更新に失敗しました')
    }
  }

  /**
   * メモを削除する関数
   * @param {number} id - メモのID
   */
  const handleDeleteMemo = async (id) => {
    try {
      // メモを削除するAPIを呼び出し
      const response = await fetch(`/api/memos/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      // エラーレスポンスなら例外を発生させる
      if (!response.ok) {
        throw new Error(data.error || 'メモの削除に失敗しました')
      }

      // 削除後に一覧を再読み込み
      await loadMemos()
    } catch (err) {
      console.error('メモの削除に失敗しました:', err)
      setError(err.message || 'メモの削除に失敗しました')
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

      {/* メモ一覧（読み込み中はメッセージを表示） */}
      {isLoading ? (
        <p>読み込み中...</p>
      ) : (
        <MemoList
          memos={memos}
          onEditMemo={handleEditMemo}
          onDeleteMemo={handleDeleteMemo}
        />
      )}
    </div>
  )
}

export default App
