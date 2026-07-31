'use client'

import { useState } from 'react'

/**
 * メモ入力フォームコンポーネント
 * タイトルと内容を入力してメモを追加する
 */
function MemoForm({ onAddMemo }) {
  // タイトルの入力値を管理
  const [title, setTitle] = useState('')

  // 内容の入力値を管理
  const [content, setContent] = useState('')

  /**
   * フォーム送信時の処理
   * @param {Event} e - イベントオブジェクト
   */
  const handleSubmit = (e) => {
    // ページのリロードを防止
    e.preventDefault()

    // 入力値が空の場合は追加しない
    if (!title.trim() || !content.trim()) {
      alert('タイトルと内容を入力してください')
      return
    }

    // 親コンポーネントの関数を呼び出してメモを追加
    onAddMemo(title, content)

    // フォームをクリア
    setTitle('')
    setContent('')
  }

  return (
    <div className="memo-form">
      <h2>メモを追加</h2>
      <form onSubmit={handleSubmit}>
        {/* タイトル入力欄 */}
        <div className="form-group">
          <label htmlFor="title">タイトル</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="メモのタイトルを入力"
          />
        </div>

        {/* 内容入力欄 */}
        <div className="form-group">
          <label htmlFor="content">内容</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="メモの内容を入力"
            rows={4}
          />
        </div>

        {/* 追加ボタン */}
        <button type="submit">追加</button>
      </form>
    </div>
  )
}

export default MemoForm
