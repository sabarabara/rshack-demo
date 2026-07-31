# Route Handler移行 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Server Actions（`use server`）をRoute Handler（REST API）に置き換え、ブラウザのNetworkタブでAPI通信を確認できるようにする。

**Architecture:** `app/api/*/route.js` がRESTエンドポイントを提供する。`src/sqlite/*.js` は `'use server'` を外した純粋なサーバーDB関数になり、Route Handlerからサーバー内で呼ばれる。`src/App.jsx` はfetchでAPIを呼び、HTTPステータスコードとJSONを受け取る。

**Tech Stack:** Next.js 15 App Router, React 19, node:sqlite, fetch API

**対象仕様:** `docs/superpowers/specs/2026-07-31-memo-demo-nextjs-design.md`（Route Handler版）

---

## 現在の状態（前提）

- `src/sqlite/{getMemos,createMemo,updateMemo,deleteMemo}.js` が `'use server'` 付きのServer Action
- `src/App.jsx`（Client Component）がそれらを直接importしてawaitしている
- `app/page.jsx`（Server Component）が `getMemos()` を呼び `initialMemos` propとして渡している
- `jsconfig.json` に `@/*` → `./*` のパスエイリアス設定済み（`@/src/...` が使える）
- 本プランはタスク順序を工夫してあり、**各コミット時点でアプリが動作可能なまま移行できる**

## タスク一覧

| Task | 内容 | コミットメッセージ |
|------|------|------------------|
| 1 | `app/api/memos/route.js` 作成（GET / POST） | feat: add memo list and create API route handlers |
| 2 | `app/api/memos/[id]/route.js` 作成（PUT / DELETE） | feat: add memo update and delete API route handlers |
| 3 | `src/App.jsx` をfetchベースに書き換え | refactor: switch App to fetch-based API calls |
| 4 | `src/sqlite/*.js` から `'use server'` を削除 | refactor: convert sqlite server actions to db functions |
| 5 | `app/page.jsx` を簡素化 | refactor: simplify page to render client App |
| 6 | `README.md` をREST API構成に更新 | docs: update README for REST API architecture |
| 7 | ビルドとAPI動作確認（curlでのCRUDテスト） | （コミットなし） |

---

### Task 1: メモ一覧取得・追加のAPI（app/api/memos/route.js）

**Files:**
- Create: `app/api/memos/route.js`

- [ ] **Step 1: `app/api/memos/route.js` を作成する**

`app/api/memos/route.js` を新規作成し、以下の内容を記述する。

```js
import { NextResponse } from 'next/server'
import { getMemos } from '@/src/sqlite/getMemos'
import { createMemo } from '@/src/sqlite/createMemo'

// メモ一覧を取得するAPI（GET /api/memos）
export async function GET() {
  // DBからメモ一覧を取得
  const memos = await getMemos()

  // JSON形式で返す
  return NextResponse.json(memos)
}

// メモを追加するAPI（POST /api/memos）
export async function POST(request) {
  // リクエストボディのJSONを取得
  const { title, content } = await request.json()

  // DBにメモを追加（成功ならtrue）
  const success = await createMemo(title, content)

  if (success) {
    // 成功時は201 Createdを返す
    return NextResponse.json({ success: true }, { status: 201 })
  } else {
    // 失敗時は400 Bad Requestを返す
    return NextResponse.json({ error: 'メモの追加に失敗しました' }, { status: 400 })
  }
}
```

`@/src/sqlite/...` は `jsconfig.json` のパスエイリアスで `./src/sqlite/...` に解決される（動作確認済み）。

- [ ] **Step 2: 動作確認（開発サーバーでGET /api/memos）**

開発サーバーをバックグラウンドで起動し、APIがJSONを返すことを確認する。

```bash
npm run dev > /tmp/memo-dev.log 2>&1 &
DEV_PID=$!
sleep 6
curl -s http://localhost:3000/api/memos
kill $DEV_PID
```

期待結果: `[]`（DBが空の場合。既存データがあればメモの配列が返る）
※初回アクセスで `data/memo.db` と `memo` テーブルが自動生成される。

- [ ] **Step 3: コミット**

```bash
git add app/api/memos/route.js
git commit -m "feat: add memo list and create API route handlers"
```

---

### Task 2: メモ更新・削除のAPI（app/api/memos/[id]/route.js）

**Files:**
- Create: `app/api/memos/[id]/route.js`

- [ ] **Step 1: `app/api/memos/[id]/route.js` を作成する**

`app/api/memos/[id]/route.js` を新規作成し、以下の内容を記述する。

```js
import { NextResponse } from 'next/server'
import { updateMemo } from '@/src/sqlite/updateMemo'
import { deleteMemo } from '@/src/sqlite/deleteMemo'

// メモを更新するAPI（PUT /api/memos/[id]）
export async function PUT(request, { params }) {
  // Next.js 15ではparamsはPromiseなのでawaitで取り出す
  const { id } = await params

  // リクエストボディのJSONを取得
  const { title, content } = await request.json()

  // DBのメモを更新（成功ならtrue）
  const success = await updateMemo(id, title, content)

  if (success) {
    // 成功時は200 OKを返す
    return NextResponse.json({ success: true })
  } else {
    // 失敗時は400 Bad Requestを返す
    return NextResponse.json({ error: 'メモの更新に失敗しました' }, { status: 400 })
  }
}

// メモを削除するAPI（DELETE /api/memos/[id]）
export async function DELETE(request, { params }) {
  // Next.js 15ではparamsはPromiseなのでawaitで取り出す
  const { id } = await params

  // DBのメモを削除（成功ならtrue）
  const success = await deleteMemo(id)

  if (success) {
    // 成功時は200 OKを返す
    return NextResponse.json({ success: true })
  } else {
    // 失敗時は400 Bad Requestを返す
    return NextResponse.json({ error: 'メモの削除に失敗しました' }, { status: 400 })
  }
}
```

注: `params.id` は文字列で受け取るが、SQLiteはINTEGERと文字列を比較する際に自動変換するためそのまま利用できる（`updateMemo` / `deleteMemo` のバリデーションも `!id` 判定のみ）。

- [ ] **Step 2: 動作確認（開発サーバーでCRUD一巡）**

開発サーバーを起動し、POST → PUT → DELETE の一連の流れを確認する。

```bash
npm run dev > /tmp/memo-dev.log 2>&1 &
DEV_PID=$!
sleep 6
curl -s http://localhost:3000/api/memos
curl -s -X POST http://localhost:3000/api/memos -H "Content-Type: application/json" -d '{"title":"テスト","content":"動作確認"}'
curl -s http://localhost:3000/api/memos
curl -s -X PUT http://localhost:3000/api/memos/1 -H "Content-Type: application/json" -d '{"title":"更新済み","content":"更新OK"}'
curl -s -X DELETE http://localhost:3000/api/memos/1
curl -s http://localhost:3000/api/memos
kill $DEV_PID
```

期待結果:
1. 1つ目: `[]`（または既存データ）
2. 2つ目: `{"success":true}`
3. 3つ目: 追加したメモが配列に含まれる（`id: 1`）
4. 4つ目: `{"success":true}`
5. 5つ目: `{"success":true}`
6. 6つ目: `[]`（削除されている）

※テストデータは最後に削除されるためDBは空に戻る。

- [ ] **Step 3: コミット**

```bash
git add "app/api/memos/[id]/route.js"
git commit -m "feat: add memo update and delete API route handlers"
```

---

### Task 3: src/App.jsx をfetchベースに書き換え

**Files:**
- Modify: `src/App.jsx`（全書き換え）

- [ ] **Step 1: `src/App.jsx` を全書き換えする**

`src/App.jsx` の内容をすべて以下に置き換える。SQLite関数のimportをすべて削除し、`fetch` + `useEffect` を使う構成にする。

```jsx
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
```

変更点のまとめ:
- SQLite関数のimport（getMemos / createMemo / updateMemo / deleteMemo）を削除
- `initialMemos` propを受け取るのをやめ、`useEffect` で初回にfetch
- `isLoading` 状態を追加し、読み込み中は「読み込み中...」を表示
- 各ハンドラでfetchを呼び、`response.ok` でエラー判定、成功後に `loadMemos()` で再取得

- [ ] **Step 2: 差分確認（不要なimportが残っていないこと）**

```bash
git diff src/App.jsx
```

`import { getMemos } from './sqlite/getMemos'` など、sqlite関連のimportが残っていないことを確認する。

- [ ] **Step 3: コミット**

```bash
git add src/App.jsx
git commit -m "refactor: switch App to fetch-based API calls"
```

---

### Task 4: src/sqlite/*.js から 'use server' を削除

**Files:**
- Modify: `src/sqlite/getMemos.js`
- Modify: `src/sqlite/createMemo.js`
- Modify: `src/sqlite/updateMemo.js`
- Modify: `src/sqlite/deleteMemo.js`

- [ ] **Step 1: `src/sqlite/getMemos.js` を更新する**

1行目の `'use server'` を削除し、先頭のJSDocコメントをDB関数の説明に変更する。

```js
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
```

- [ ] **Step 2: `src/sqlite/createMemo.js` を更新する**

`'use server'` を削除し、JSDocをDB関数の説明に変更する。

```js
import { getDatabase } from '../database/database'

/**
 * 新しいメモを追加するDB関数
 * Route Handler（app/api/memos/route.js）から呼び出される
 * @param {string} title - メモのタイトル
 * @param {string} content - メモの内容
 * @returns {Promise<boolean>} 成功したかどうか
 */
export async function createMemo(title, content) {
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
    db.prepare(sql).run(title, content, createdAt)

    console.log('メモを追加しました:', title)
    return true
  } catch (error) {
    console.error('メモの追加に失敗しました:', error)
    return false
  }
}
```

- [ ] **Step 3: `src/sqlite/updateMemo.js` を更新する**

`'use server'` を削除し、JSDocをDB関数の説明に変更する。

```js
import { getDatabase } from '../database/database'

/**
 * メモを更新するDB関数
 * Route Handler（app/api/memos/[id]/route.js）から呼び出される
 * @param {number} id - メモのID
 * @param {string} title - 新しいタイトル
 * @param {string} content - 新しい内容
 * @returns {Promise<boolean>} 成功したかどうか
 */
export async function updateMemo(id, title, content) {
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
    db.prepare(sql).run(title, content, id)

    console.log('メモを更新しました:', id)
    return true
  } catch (error) {
    console.error('メモの更新に失敗しました:', error)
    return false
  }
}
```

- [ ] **Step 4: `src/sqlite/deleteMemo.js` を更新する**

`'use server'` を削除し、JSDocをDB関数の説明に変更する。

```js
import { getDatabase } from '../database/database'

/**
 * メモを削除するDB関数
 * Route Handler（app/api/memos/[id]/route.js）から呼び出される
 * @param {number} id - メモのID
 * @returns {Promise<boolean>} 成功したかどうか
 */
export async function deleteMemo(id) {
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
    db.prepare(sql).run(id)

    console.log('メモを削除しました:', id)
    return true
  } catch (error) {
    console.error('メモの削除に失敗しました:', error)
    return false
  }
}
```

- [ ] **Step 5: 残存チェック（'use server' が残っていないこと）**

```bash
grep -rn "use server" src/ app/ || echo "OK: use server は残っていない"
```

期待結果: `OK: use server は残っていない`（`'use client'` は残るため除外注意。ここでは `use server` のみを対象とする）

- [ ] **Step 6: コミット**

```bash
git add src/sqlite/getMemos.js src/sqlite/createMemo.js src/sqlite/updateMemo.js src/sqlite/deleteMemo.js
git commit -m "refactor: convert sqlite server actions to db functions"
```

---

### Task 5: app/page.jsx を簡素化

**Files:**
- Modify: `app/page.jsx`（全書き換え）

- [ ] **Step 1: `app/page.jsx` を全書き換えする**

`app/page.jsx` の内容をすべて以下に置き換える。Server Actionsの直接呼び出しと `force-dynamic`、`initialMemos` 渡しを削除する。

```jsx
import App from '../src/App'

// ホームページ（Server Component）
// データ取得はClient Component（App）がfetchで行う
export default function Page() {
  return <App />
}
```

- [ ] **Step 2: 差分確認**

```bash
git diff app/page.jsx
```

`getMemos` のimport、`async`、`force-dynamic`、`initialMemos` がすべて消えていることを確認する。

- [ ] **Step 3: コミット**

```bash
git add app/page.jsx
git commit -m "refactor: simplify page to render client App"
```

---

### Task 6: README.md をREST API構成に更新

**Files:**
- Modify: `README.md`（全書き換え）

- [ ] **Step 1: `README.md` を全書き換えする**

`README.md` の内容をすべて以下に置き換える。

```markdown
# メモアプリ（Next.js + SQLite）

ハッカソン勉強会で使用するハンズオン用デモアプリです。

## 概要

Next.js（App Router）とSQLite（node:sqlite）を使用したメモアプリです。
ブラウザはREST API（Route Handler）をfetchで呼び出し、サーバー側のSQLiteを操作します。
ブラウザの開発者ツール（Networkタブ）でAPI通信を確認できます。

## 機能

- メモの追加（POST /api/memos）
- メモの一覧表示（GET /api/memos）
- メモの編集（PUT /api/memos/[id]）
- メモの削除（DELETE /api/memos/[id]）
- サーバー側SQLiteによるデータ永続化

## 技術スタック

- Next.js 15（App Router）
- React 19
- node:sqlite（Node.js組み込みのSQLite）

## 環境構築

### 前提条件

- Node.js 22.13以上（node:sqliteを使用するため）
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

ブラウザで http://localhost:3000 を開いてください。
メモの追加・編集・削除を行った後、開発者ツールのNetworkタブでAPI通信を確認できます。

## データの流れ

ブラウザ → fetch → Route Handler（app/api/*）→ DB関数（src/sqlite/*.js）→ SQLite（data/memo.db）

## ディレクトリ構成

```
memo-demo/
├── package.json          # プロジェクト設定
├── jsconfig.json         # パスエイリアス設定
├── README.md             # このファイル
├── app/
│   ├── api/
│   │   ├── memos/
│   │   │   ├── route.js      # GET/POST（一覧取得・追加）
│   │   │   └── [id]/
│   │   │       └── route.js  # PUT/DELETE（更新・削除）
│   ├── layout.jsx        # ルートレイアウト（CSS読み込み）
│   └── page.jsx          # ホームページ（Server Component）
├── data/
│   └── memo.db           # SQLiteデータベース（自動生成）
└── src/
    ├── App.jsx           # メインコンポーネント（Client Component）
    ├── App.css           # スタイルシート
    ├── database/
    │   └── database.js   # SQLite初期化（node:sqlite）
    ├── components/
    │   ├── MemoForm.jsx  # メモ入力フォーム
    │   └── MemoList.jsx  # メモ一覧表示
    └── sqlite/
        ├── createMemo.js # メモ追加（INSERT）
        ├── getMemos.js   # メモ取得（SELECT）
        ├── updateMemo.js # メモ更新（UPDATE）
        └── deleteMemo.js # メモ削除（DELETE）
```

## クライアントとサーバーの区分

| ファイル | 区分 | ディレクティブ |
|---------|------|---------------|
| app/layout.jsx | Server Component | なし |
| app/page.jsx | Server Component | なし |
| app/api/memos/route.js | Route Handler | なし |
| app/api/memos/[id]/route.js | Route Handler | なし |
| src/App.jsx | Client Component | use client |
| src/components/MemoForm.jsx | Client Component | use client |
| src/components/MemoList.jsx | Client Component | use client |
| src/database/database.js | Server専用 | なし |
| src/sqlite/*.js | Server専用 | なし |

- `use client`: ブラウザ側で動作するコンポーネント
- Route Handler: サーバー側で動くAPI。ブラウザからfetchで呼び出す

## 使用ライブラリ

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| Next.js | ^15.1.0 | フレームワーク |
| React | ^19.0.0 | UIライブラリ |
| react-dom | ^19.0.0 | React DOMレンダリング |
| node:sqlite | 組み込み | SQLiteデータベース |

## 各ファイルの役割

### app/layout.jsx
ルートレイアウト。全ページ共通のHTML構造とグローバルCSSの読み込みを行います。

### app/page.jsx
ホームページ（Server Component）。Appコンポーネントを表示します。データ取得はClient Componentがfetchで行います。

### app/api/memos/route.js
メモ一覧取得（GET）と追加（POST）を行うAPIです。

### app/api/memos/[id]/route.js
メモ更新（PUT）と削除（DELETE）を行うAPIです。

### src/App.jsx
メインコンポーネント（Client Component）。以下の責務を持ちます：
- メモ一覧の状態管理
- fetchによるAPI呼び出し（GET/POST/PUT/DELETE）
- 各操作（追加・更新・削除）のハンドリング

### src/database/database.js
node:sqliteでデータベースファイルを開き、memoテーブルを作成します。初回呼び出し時に自動で初期化されます。

### src/components/MemoForm.jsx
メモ入力フォームコンポーネント。タイトルと内容を入力してメモを追加します。

### src/components/MemoList.jsx
メモ一覧表示コンポーネント。テーブル形式でメモを表示し、編集・削除機能を提供します。

### src/sqlite/createMemo.js
メモ追加のDB関数。INSERT文を使用して新しいメモをデータベースに追加します。

### src/sqlite/getMemos.js
メモ取得のDB関数。SELECT文を使用して全てのメモを取得します。

### src/sqlite/updateMemo.js
メモ更新のDB関数。UPDATE文を使用して既存のメモを更新します。

### src/sqlite/deleteMemo.js
メモ削除のDB関数。DELETE文を使用してメモを削除します。

## 学習ポイント

### Next.js
- Server ComponentとClient Componentの区別（use client）
- Route Handler（app/api/*）
- サーバー側でのデータベースアクセス

### REST API
- fetchによるAPI呼び出し（GET/POST/PUT/DELETE）
- HTTPステータスコード（200/201/400）
- JSONでのデータ受け渡し
- ブラウザのNetworkタブでの通信確認

### React
- useState: コンポーネントの状態管理
- useEffect: マウント時のデータ取得
- プロパティによるコンポーネント間の通信
- イベントハンドリング

### SQLite
- CREATE TABLE: テーブル作成
- SELECT: データ取得
- INSERT: データ追加
- UPDATE: データ更新
- DELETE: データ削除
- プリペアドステートメント（SQLインジェクション防止）
```

- [ ] **Step 2: コミット**

```bash
git add README.md
git commit -m "docs: update README for REST API architecture"
```

---

### Task 7: ビルドとAPI動作確認

**Files:**
- （コード変更なし。動作確認のみ）

- [ ] **Step 1: 本番ビルドが通ること**

```bash
npm run build
```

期待結果: ビルドが成功する。`/` が静的（`○`）、`/api/memos` と `/api/memos/[id]` が `ƒ`（動的）として出力される。

- [ ] **Step 2: 本番サーバーでAPIのCRUD一巡を確認**

```bash
npm run start > /tmp/memo-start.log 2>&1 &
SRV_PID=$!
sleep 4

# 1. 一覧（空）
curl -s http://localhost:3000/api/memos
# 期待: []

# 2. 追加
curl -s -X POST http://localhost:3000/api/memos -H "Content-Type: application/json" -d '{"title":"テストタイトル","content":"テスト内容"}'
# 期待: {"success":true}（201 Created）

# 3. 一覧に追加されている
curl -s http://localhost:3000/api/memos
# 期待: [{"id":1,"title":"テストタイトル","content":"テスト内容","created_at":"..."}]

# 4. 更新
curl -s -X PUT http://localhost:3000/api/memos/1 -H "Content-Type: application/json" -d '{"title":"更新タイトル","content":"更新内容"}'
# 期待: {"success":true}

# 5. 削除
curl -s -X DELETE http://localhost:3000/api/memos/1
# 期待: {"success":true}

# 6. 空に戻る
curl -s http://localhost:3000/api/memos
# 期待: []

# 7. ページ表示
curl -s http://localhost:3000/ | grep -o "メモアプリ"
# 期待: メモアプリ

kill $SRV_PID
```

- [ ] **Step 3: サーバー再起動後もデータが残ること（永続化）を確認**

DBにメモを1件追加した状態でサーバーを再起動し、データが残っていることを確認する。

```bash
npm run start > /tmp/memo-start.log 2>&1 &
SRV_PID=$!
sleep 4

# メモを1件追加
curl -s -X POST http://localhost:3000/api/memos -H "Content-Type: application/json" -d '{"title":"永続化確認","content":"再起動しても残るはず"}'
# 期待: {"success":true}

# サーバーを一旦停止
kill $SRV_PID
sleep 2

# サーバーを再起動
npm run start > /tmp/memo-start.log 2>&1 &
SRV_PID=$!
sleep 4

# 一覧にメモが残っていること
curl -s http://localhost:3000/api/memos
# 期待: [{"id":1,"title":"永続化確認","content":"再起動しても残るはず",...}]

# 後片付け（削除して空に戻す）
curl -s -X DELETE http://localhost:3000/api/memos/1
# 期待: {"success":true}

kill $SRV_PID
```

- [ ] **Step 4: テストデータをクリーンアップ**

CRUDテストで生成された `data/memo.db` を削除し、初回起動時のきれいな状態に戻す。

```bash
rm -f data/memo.db
```

- [ ] **Step 5: 最終状態の確認**

```bash
git status
```

期待結果: 作業ツリーがクリーン（`data/` は `.gitignore` 対象のため表示されない）

---

## 自己レビュー

**1. 仕様カバレッジ（specとの対応）**

| specの要件 | 対応タスク |
|-----------|----------|
| §12 API仕様: GET /api/memos | Task 1 |
| §12 API仕様: POST /api/memos | Task 1 |
| §12 API仕様: PUT /api/memos/[id] | Task 2 |
| §12 API仕様: DELETE /api/memos/[id] | Task 2 |
| §16 API呼び出しの失敗（response.ok + setError） | Task 3 |
| §11 src/sqlite/*.js がServer専用DB関数に | Task 4 |
| §10 app/page.jsx が `<App />` のみ表示 | Task 5 |
| §19 完成条件: NetworkタブでAPI確認 | Task 6（README説明）+ Task 7（動作確認） |
| §19 完成条件: サーバー再起動後もデータが残る | Task 7 Step 3（永続化確認） |

**2. プレースホルダースキャン:** すべてのコードステップに完全な内容を記載済み。TBD/TODOなし。

**3. 型・名前の整合性:**
- 関数名: `getMemos` / `createMemo` / `updateMemo` / `deleteMemo` は既存実装と一致
- Route Handlerの関数名: `GET` / `POST` / `PUT` / `DELETE`（Next.js規約）
- `updateMemo(id, title, content)` / `deleteMemo(id)` の引数順は既存実装と一致
- `params.id` は文字列で受け取るが、SQLiteの型変換により `!id` バリデーションと `WHERE id = ?` の両方で問題なし
