# Memo Demo App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a beginner-friendly memo CRUD app using React and sql.js (SQLite in browser) with LocalStorage persistence.

**Architecture:** Single-page React app with no router, no state management library. Data persists via sql.js WebAssembly SQLite running entirely in the browser, saved to LocalStorage. Each SQLite operation is a separate file for clarity.

**Tech Stack:** React 18, Vite, sql.js (SQLite WebAssembly)

---

## File Structure

```
memo-demo/
├── package.json
├── index.html
├── README.md
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Main component, holds state
│   ├── App.css               # Styles
│   ├── database/
│   │   └── database.js       # sql.js initialization + LocalStorage save/restore
│   ├── components/
│   │   ├── MemoForm.jsx      # Title/content input + add button
│   │   └── MemoList.jsx      # Displays memo list with edit/delete buttons
│   └── sqlite/
│       ├── createMemo.js     # INSERT SQL
│       ├── getMemos.js       # SELECT SQL
│       ├── updateMemo.js     # UPDATE SQL
│       └── deleteMemo.js     # DELETE SQL
└── public/
    └── (empty)
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/App.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "memo-demo",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "sql.js": "^1.9.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create index.html**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>メモアプリ</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

// ReactアプリをDOMにマウントする
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 4: Create src/App.jsx (initial)**

```jsx
import { useState, useEffect } from 'react'

// メモアプリのメインコンポーネント
function App() {
  return (
    <div className="app">
      <h1>メモアプリ</h1>
      <p>メモアプリを作成中です...</p>
    </div>
  )
}

export default App
```

- [ ] **Step 5: Create src/App.css (initial)**

```css
/* 全体のスタイル */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}
```

- [ ] **Step 6: Create vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Viteの設定 - Reactプラグインを使用
export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 7: Install dependencies and verify**

```bash
cd memo-demo && npm install
```

- [ ] **Step 8: Start dev server to verify**

```bash
npm run dev
```

Expected: Server starts, http://localhost:5173 shows "メモアプリを作成中です..."

- [ ] **Step 9: Stop dev server**

```bash
# Ctrl+C
```

- [ ] **Step 10: Commit**

```bash
git init
git add -A
git commit -m "feat: project scaffolding with Vite + React"
```

---

## Task 2: SQLite Database Initialization

**Files:**
- Create: `src/database/database.js`

- [ ] **Step 1: Create src/database/database.js**

```js
import initSqlJs from 'sql.js'

// sql.jsのWebAssemblyバイト列を保存する変数
let SQL = null

// データベースインスタンスを保持する変数
let db = null

// LocalStorageのキー名
const DB_STORAGE_KEY = 'memo-database'

/**
 * データベースを初期化する関数
 * sql.jsを読み込み、既存のデータベースがある場合は復元する
 * ない場合は新しいデータベースを作成する
 */
export async function initDatabase() {
  // sql.jsの初期化（WebAssemblyを読み込む）
  SQL = await initSqlJs()

  // LocalStorageから既存のデータベースを復元
  const savedData = localStorage.getItem(DB_STORAGE_KEY)

  if (savedData) {
    // 保存されたデータがある場合は復元
    const uintArray = new Uint8Array(JSON.parse(savedData))
    db = new SQL.Database(uintArray)
    console.log('データベースをLocalStorageから復元しました')
  } else {
    // 新しいデータベースを作成
    db = new SQL.Database()
    console.log('新しいデータベースを作成しました')

    // memoテーブルを作成
    createMemoTable()
  }

  return db
}

/**
 * memoテーブルを作成する関数
 */
function createMemoTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS memo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `
  db.run(sql)
  console.log('memoテーブルを作成しました')
}

/**
 * データベースをLocalStorageに保存する関数
 */
export function saveDatabase() {
  if (!db) {
    console.error('データベースが初期化されていません')
    return
  }

  // データベースのバイナリデータを取得
  const data = db.export()
  // Uint8ArrayをJSON保存可能な形式に変換
  const jsonArray = Array.from(data)
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(jsonArray))
  console.log('データベースをLocalStorageに保存しました')
}

/**
 * データベースインスタンスを取得する関数
 */
export function getDatabase() {
  if (!db) {
    console.error('データベースが初期化されていません')
    return null
  }
  return db
}
```

- [ ] **Step 2: Commit**

```bash
git add src/database/database.js
git commit -m "feat: SQLite database initialization with LocalStorage persistence"
```

---

## Task 3: SQLite CRUD Operations

**Files:**
- Create: `src/sqlite/getMemos.js`
- Create: `src/sqlite/createMemo.js`
- Create: `src/sqlite/updateMemo.js`
- Create: `src/sqlite/deleteMemo.js`

- [ ] **Step 1: Create src/sqlite/getMemos.js**

```js
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
```

- [ ] **Step 2: Create src/sqlite/createMemo.js**

```js
import { getDatabase, saveDatabase } from '../database/database'

/**
 * 新しいメモを追加する関数
 * @param {string} title - メモのタイトル
 * @param {string} content - メモの内容
 * @returns {boolean} 成功したかどうか
 */
export function createMemo(title, content) {
  const db = getDatabase()
  if (!db) {
    console.error('データベースが利用できません')
    return false
  }

  // 入力値のバリデーション
  if (!title || !content) {
    console.error('タイトルと内容は必須です')
    return false
  }

  try {
    // 現在の日時を取得（ISO形式）
    const createdAt = new Date().toISOString()

    // プリペアドステートメントでSQLインジェクションを防ぐ
    const sql = 'INSERT INTO memo (title, content, created_at) VALUES (?, ?, ?)'
    db.run(sql, [title, content, createdAt])

    // データベースをLocalStorageに保存
    saveDatabase()
    console.log('メモを追加しました:', title)
    return true
  } catch (error) {
    console.error('メモの追加に失敗しました:', error)
    return false
  }
}
```

- [ ] **Step 3: Create src/sqlite/updateMemo.js**

```js
import { getDatabase, saveDatabase } from '../database/database'

/**
 * メモを更新する関数
 * @param {number} id - メモのID
 * @param {string} title - 新しいタイトル
 * @param {string} content - 新しい内容
 * @returns {boolean} 成功したかどうか
 */
export function updateMemo(id, title, content) {
  const db = getDatabase()
  if (!db) {
    console.error('データベースが利用できません')
    return false
  }

  // 入力値のバリデーション
  if (!id || !title || !content) {
    console.error('ID、タイトル、内容は必須です')
    return false
  }

  try {
    // プリペアドステートメントでSQLインジェクションを防ぐ
    const sql = 'UPDATE memo SET title = ?, content = ? WHERE id = ?'
    db.run(sql, [title, content, id])

    // データベースをLocalStorageに保存
    saveDatabase()
    console.log('メモを更新しました:', id)
    return true
  } catch (error) {
    console.error('メモの更新に失敗しました:', error)
    return false
  }
}
```

- [ ] **Step 4: Create src/sqlite/deleteMemo.js**

```js
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
```

- [ ] **Step 5: Commit**

```bash
git add src/sqlite/
git commit -m "feat: SQLite CRUD operations (get, create, update, delete)"
```

---

## Task 4: MemoForm Component

**Files:**
- Create: `src/components/MemoForm.jsx`

- [ ] **Step 1: Create src/components/MemoForm.jsx**

```jsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MemoForm.jsx
git commit -m "feat: MemoForm component for adding new memos"
```

---

## Task 5: MemoList Component

**Files:**
- Create: `src/components/MemoList.jsx`

- [ ] **Step 1: Create src/components/MemoList.jsx**

```jsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MemoList.jsx
git commit -m "feat: MemoList component with edit and delete functionality"
```

---

## Task 6: Integrate Components in App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Update src/App.jsx**

```jsx
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
        setError('データベースの初期化に失敗しました')
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
    const success = createMemo(title, content)
    if (success) {
      // 追加後に一覧を再読み込み
      loadMemos()
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
  const handleEditMemo = (id, title, content) => {
    const success = updateMemo(id, title, content)
    if (success) {
      // 更新後に一覧を再読み込み
      loadMemos()
    } else {
      setError('メモの更新に失敗しました')
    }
  }

  /**
   * メモを削除する関数
   * @param {number} id - メモのID
   */
  const handleDeleteMemo = (id) => {
    const success = deleteMemo(id)
    if (success) {
      // 削除後に一覧を再読み込み
      loadMemos()
    } else {
      setError('メモの削除に失敗しました')
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
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: integrate all components in App.jsx with state management"
```

---

## Task 7: Complete CSS Styling

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Update src/App.css**

```css
/* 全体のスタイル */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

h2 {
  margin-bottom: 15px;
  color: #34495e;
}

/* エラーメッセージのスタイル */
.error-message {
  background-color: #fee;
  border: 1px solid #fcc;
  padding: 10px 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message p {
  color: #c00;
}

.error-message button {
  background: none;
  border: none;
  color: #c00;
  cursor: pointer;
  font-size: 16px;
}

/* フォームのスタイル */
.memo-form {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.memo-form button {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.memo-form button:hover {
  background-color: #2980b9;
}

/* メモ一覧のスタイル */
.memo-list {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.no-memo {
  text-align: center;
  color: #999;
  padding: 20px;
}

/* テーブルのスタイル */
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #555;
}

td input,
td textarea {
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

/* ボタンのスタイル */
button {
  margin-right: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

button:first-of-type {
  background-color: #3498db;
  color: white;
}

button:first-of-type:hover {
  background-color: #2980b9;
}

button:last-of-type {
  background-color: #95a5a6;
  color: white;
}

button:last-of-type:hover {
  background-color: #7f8c8d;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.css
git commit -m "feat: complete CSS styling for memo app"
```

---

## Task 8: Create README.md

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

```markdown
# メモアプリ（React + SQLite）

ハッカソン勉強会で使用するハンズオン用デモアプリです。

## 概要

Reactとsql.js（ブラウザ内SQLite）を使用したメモアプリです。
バックエンドはなく、全てブラウザ上で動作します。

## 機能

- メモの追加
- メモの一覧表示
- メモの編集
- メモの削除
- LocalStorageによるデータ永続化

## 技術スタック

- React 18
- Vite
- sql.js（SQLite WebAssembly）

## 環境構築

### 前提条件

- Node.js 18以上
- npm

### セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>

# ディレクトリに移動
cd memo-demo

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:5173 を開いてください。

## ディレクトリ構成

```
memo-demo/
├── package.json          # プロジェクト設定
├── index.html            # HTMLエントリーポイント
├── vite.config.js        # Vite設定
├── README.md             # このファイル
├── public/
└── src/
    ├── main.jsx          # Reactエントリーポイント
    ├── App.jsx           # メインコンポーネント
    ├── App.css           # スタイルシート
    ├── database/
    │   └── database.js   # SQLite初期化・LocalStorage管理
    ├── components/
    │   ├── MemoForm.jsx  # メモ入力フォーム
    │   └── MemoList.jsx  # メモ一覧表示
    └── sqlite/
        ├── createMemo.js # メモ追加（INSERT）
        ├── getMemos.js   # メモ取得（SELECT）
        ├── updateMemo.js # メモ更新（UPDATE）
        └── deleteMemo.js # メモ削除（DELETE）
```

## 使用ライブラリ

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| React | ^18.2.0 | UIライブラリ |
| react-dom | ^18.2.0 | React DOMレンダリング |
| sql.js | ^1.9.0 | SQLite WebAssembly |
| Vite | ^5.0.0 | ビルドツール |
| @vitejs/plugin-react | ^4.2.0 | Vite Reactプラグイン |

## 各ファイルの役割

### src/main.jsx
Reactアプリケーションのエントリーポイント。ReactDOM.createRootを使用してアプリをDOMにマウントします。

### src/App.jsx
メインコンポーネント。以下の責務を持ちます：
- データベースの初期化
- メモ一覧の状態管理
- 各操作（追加・更新・削除）のハンドリング

### src/database/database.js
sql.jsの初期化とLocalStorageへのデータ永続化を管理します。
- initDatabase(): データベースを初期化（LocalStorageから復元 or 新規作成）
- saveDatabase(): データベースをLocalStorageに保存
- getDatabase(): データベースインスタンスを取得

### src/components/MemoForm.jsx
メモ入力フォームコンポーネント。タイトルと内容を入力してメモを追加します。

### src/components/MemoList.jsx
メモ一覧表示コンポーネント。テーブル形式でメモを表示し、編集・削除機能を提供します。

### src/sqlite/createMemo.js
メモ追加機能。INSERT文を使用して新しいメモをデータベースに追加します。

### src/sqlite/getMemos.js
メモ取得機能。SELECT文を使用して全てのメモを取得します。

### src/sqlite/updateMemo.js
メモ更新機能。UPDATE文を使用して既存のメモを更新します。

### src/sqlite/deleteMemo.js
メモ削除機能。DELETE文を使用してメモを削除します。

## 学習ポイント

### React
- useState: コンポーネントの状態管理
- useEffect: サイドエフェクト（データベース初期化）
- プロパティによるコンポーネント間の通信
- イベントハンドリング

### SQLite
- CREATE TABLE: テーブル作成
- SELECT: データ取得
- INSERT: データ追加
- UPDATE: データ更新
- DELETE: データ削除
- プリペアドステートメント（SQLインジェクション防止）

### データ永続化
- LocalStorageの使用方法
- バイナリデータの保存・復元
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add comprehensive README with setup instructions"
```

---

## Task 9: Final Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Install dependencies**

```bash
cd memo-demo && npm install
```

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

- [ ] **Step 3: Open browser and test**

Open http://localhost:5173 and verify:
1. App loads without errors
2. Can add a new memo
3. Memo appears in the list
4. Can edit a memo
5. Can delete a memo
6. Refresh page - data persists

- [ ] **Step 4: Stop dev server**

```bash
# Ctrl+C
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete memo demo app with CRUD operations"
```

---

## Self-Review Results

✅ **Spec coverage:** All 18 spec sections covered
- React + Vite + sql.js stack ✅
- Single page, no router ✅
- CRUD operations ✅
- LocalStorage persistence ✅
- Beginner-friendly with comments ✅
- Directory structure matches spec ✅

✅ **Placeholder scan:** No TBD/TODO found

✅ **Type consistency:** Function names and signatures consistent across files
