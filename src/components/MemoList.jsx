import { useState } from 'react'

/**
 * メモ一覧表示コンポーネント
 * メモの一覧を表示し、編集・削除機能を提供する
 */
function MemoList({ memos, onEditMemo, onDeleteMemo }) {
  // 編集中のメモIDを管理
  const [editingId, setEditingId] = useState(null)

  // 編集中のタイトルを管理
  const [editTitle, setEditTitle] = useState('')

  // 編集中の内容を管理
  const [editContent, setEditContent] = useState('')

  /**
   * 編集モードを開始する関数
   * @param {Object} memo - 編集するメモオブジェクト
   */
  const startEditing = (memo) => {
    setEditingId(memo.id)
    setEditTitle(memo.title)
    setEditContent(memo.content)
  }

  /**
   * 編集をキャンセルする関数
   */
  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  /**
   * 編集を保存する関数
   */
  const saveEdit = (id) => {
    // 入力値が空の場合は保存しない
    if (!editTitle.trim() || !editContent.trim()) {
      alert('タイトルと内容を入力してください')
      return
    }

    // 親コンポーネントの関数を呼び出してメモを更新
    onEditMemo(id, editTitle, editContent)

    // 編集モードを終了
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  /**
   * 削除確認と実行を行う関数
   * @param {number} id - 削除するメモのID
   * @param {string} title - 削除するメモのタイトル
   */
  const handleDelete = (id, title) => {
    if (window.confirm(`「${title}」を削除しますか？`)) {
      onDeleteMemo(id)
    }
  }

  // メモが空の場合の表示
  if (memos.length === 0) {
    return (
      <div className="memo-list">
        <h2>メモ一覧</h2>
        <p className="no-memo">メモはまだありません</p>
      </div>
    )
  }

  return (
    <div className="memo-list">
      <h2>メモ一覧</h2>

      {/* メモテーブル */}
      <table>
        <thead>
          <tr>
            <th>タイトル</th>
            <th>本文</th>
            <th>作成日時</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {memos.map((memo) => (
            <tr key={memo.id}>
              {editingId === memo.id ? (
                // 編集中の行
                <>
                  <td>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                    />
                  </td>
                  <td>{new Date(memo.created_at).toLocaleString('ja-JP')}</td>
                  <td>
                    <button onClick={() => saveEdit(memo.id)}>保存</button>
                    <button onClick={cancelEditing}>キャンセル</button>
                  </td>
                </>
              ) : (
                // 通常の表示
                <>
                  <td>{memo.title}</td>
                  <td>{memo.content}</td>
                  <td>{new Date(memo.created_at).toLocaleString('ja-JP')}</td>
                  <td>
                    <button onClick={() => startEditing(memo)}>編集</button>
                    <button onClick={() => handleDelete(memo.id, memo.title)}>削除</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MemoList
