import { useState, useEffect } from 'react'
import MemoForm from './components/MemoForm'
import MemoList from './components/MemoList'
import { initDatabase } from './database/database'
import { getMemos } from './sqlite/getMemos'
import { createMemo } from './sqlite/createMemo'
import { updateMemo } from './sqlite/updateMemo'
import { deleteMemo } from './sqlite/deleteMemo'

// メモアプリのメインコンポーネント
function App() {
  // メモの一覧を管理
  const [memos, setMemos] = useState([])

  // データベースの初期化状態を管理
  const [isDbReady, setIsDbReady] = useState(false)

  // エラーメッセージを管理
  const [error, setError] = useState('')

  // コンポーネントマウント時にデータベースを初期化
  useEffect(() => {
    async function setup() {
      try {
        // データベースを初期化（LocalStorageから復元 or 新規作成）
        await initDatabase()
        setIsDbReady(true)

        // メモ一覧を読み込み
        loadMemos()
      } catch (err) {
        console.error('データベースの初期化に失敗しました:', err)
        // エラーメッセージを設定（より詳細な情報を表示）
        const errorMessage = err.message || 'データベースの初期化に失敗しました'
        setError(errorMessage)
      }
    }

    setup()
  }, [])

  /**
   * メモ一覧を読み込む関数
   */
  const loadMemos = () => {
    const allMemos = getMemos()
    setMemos(allMemos)
  }

  /**
   * メモを追加する関数
   * @param {string} title - メモのタイトル
   * @param {string} content - メモの内容
   */
  const handleAddMemo = (title, content) => {
    try {
      const success = createMemo(title, content)
      if (success) {
        // 追加後に一覧を再読み込み
        loadMemos()
      }
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
  const handleEditMemo = (id, title, content) => {
    try {
      const success = updateMemo(id, title, content)
      if (success) {
        // 更新後に一覧を再読み込み
        loadMemos()
      }
    } catch (err) {
      console.error('メモの更新に失敗しました:', err)
      setError(err.message || 'メモの更新に失敗しました')
    }
  }

  /**
   * メモを削除する関数
   * @param {number} id - メモのID
   */
  const handleDeleteMemo = (id) => {
    try {
      const success = deleteMemo(id)
      if (success) {
        // 削除後に一覧を再読み込み
        loadMemos()
      }
    } catch (err) {
      console.error('メモの削除に失敗しました:', err)
      setError(err.message || 'メモの削除に失敗しました')
    }
  }

  // データベースの初期化を待っている場合
  if (!isDbReady) {
    return (
      <div className="app">
        <h1>メモアプリ</h1>
        <p>データベースを初期化中...</p>
      </div>
    )
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
