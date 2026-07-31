# メモアプリ Next.js移行 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vite + React + sql.js（ブラウザ内SQLite）のメモアプリを、Next.js App Router + node:sqlite（サーバー側SQLite）に移行する。

**Architecture:** Next.jsのServer ComponentとServer Actionsを利用するフルスタック構成。`app/page.jsx`（Server Component）が初期データを取得してClient Componentへprops渡し、CRUDは`'use server'`のServer Actionsをクライアントから直接呼び出す。データはサーバー上の`data/memo.db`に永続化する。

**Tech Stack:** Next.js 15（App Router）, React 19, node:sqlite（Node.js組み込み）

---

## ファイル構成

移行後は以下になる。Vite固有のファイル（`index.html`, `vite.config.js`, `src/main.jsx`, `public/`）は削除する。

```
memo-demo/
  app/
    layout.jsx        # 新規作成。ルートレイアウト + App.css import
    page.jsx          # 新規作成。Server Component。getMemos()で初期データ取得
  src/
    App.jsx           # 書き換え。'use client'追加、Server Actions呼び出しに変更
    App.css           # 変更なし
    database/
      database.js     # 書き換え。sql.js→node:sqlite。ファイル永続化
    components/
      MemoForm.jsx    # 'use client'追加のみ
      MemoList.jsx    # 'use client'追加のみ
    sqlite/
      createMemo.js   # 書き換え。'use server'追加、async化
      getMemos.js     # 書き換え。'use server'追加、async化
      updateMemo.js   # 書き換え。'use server'追加、async化
      deleteMemo.js   # 書き換え。'use server'追加、async化
  data/memo.db        # 実行時に自動生成（gitignore対象）
  jsconfig.json       # 新規作成。@/エイリアス設定
  package.json        # next / react 19 に変更
  .gitignore          # data/ を追加
  README.md           # Next.js向けに書き換え
```

削除するファイル: `index.html`, `vite.config.js`, `src/main.jsx`, `public/`（空ディレクトリ）

---

### Task 1: プロジェクト設定をNext.jsに変更

**Files:**
- Modify: `package.json`
- Delete: `index.html`, `vite.config.js`, `src/main.jsx`, `public/`

- [ ] **Step 1: package.jsonを書き換える**

`package.json` の内容を以下に置き換える:

```json
{
  "name": "memo-demo",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

ポイント:
- `"type": "module"` を削除（Next.jsの標準構成に合わせる）
- Viteのスクリプト（`dev`, `build`, `preview`）をNext.jsのものに変更
- `sql.js`, `vite`, `@vitejs/plugin-react` を削除

- [ ] **Step 2: Vite固有のファイルを削除する**

```bash
rm index.html vite.config.js src/main.jsx
rmdir public
```

- [ ] **Step 3: 依存関係をインストールする**

```bash
npm install
```

Run: `npm ls next react react-dom sql.js vite`
Expected: next / react / react-dom がインストールされ、sql.js / vite が**ない**こと。

- [ ] **Step 4: 動作確認**

Run: `npx next --version`
Expected: Next.jsのバージョン（15.x）が表示される。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: migrate project setup from Vite to Next.js"
```

---

### Task 2: src/database/database.jsをnode:sqliteに書き換え

**Files:**
- Modify: `src/database/database.js`

`'use server'`は付けない。このファイルはサーバー側の`sqlite/*.js`からのみimportされ、クライアントから直接呼ばれることはない。

- [ ] **Step 1: ファイルの内容を置き換える**

`src/database/database.js` の内容を以下に置き換える:

```js
import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'

// データベースインスタンスを保持する変数（サーバー起動中は同じものを使い続ける）
let db = null

/**
 * データベースを取得する関数
 * 初回呼び出し時にDBファイルを作成し、memoテーブルを生成する
 * @returns {DatabaseSync|null} データベースインスタンス（失敗時はnull）
 */
export function getDatabase() {
  // すでに初期化済みなら同じインスタンスを返す
  if (db) {
    return db
  }

  try {
    // dataディレクトリを自動作成（ない場合のみ）
    const dataDir = path.join(process.cwd(), 'data')
    fs.mkdirSync(dataDir, { recursive: true })

    // DBファイルのパスを指定してデータベースを開く
    const dbPath = path.join(dataDir, 'memo.db')
    db = new DatabaseSync(dbPath)
    console.log('データベースを開きました:', dbPath)

    // memoテーブルを作成
    createMemoTable()

    return db
  } catch (error) {
    console.error('データベースの初期化に失敗しました:', error)
    return null
  }
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
  db.exec(sql)
  console.log('memoテーブルを作成しました')
}
```

ポイント:
- sql.jsの`initSqlJs` / `SQL.Database` / `db.export()` は使わない
- `new DatabaseSync(dbPath)` でファイルに直接保存されるため、`saveDatabase()`（LocalStorage保存）は不要
- `getDatabase()` が初回呼び出し時に遅延初期化する

- [ ] **Step 2: 構文チェック**

Run: `node --check src/database/database.js`
Expected: エラーなし（`node --check`はESM構文をチェックできる）。

- [ ] **Step 3: Commit**

```bash
git add src/database/database.js
git commit -m "feat: use node:sqlite for server-side database"
```

---

### Task 3: src/sqlite/*.jsをServer Actionsに書き換え

**Files:**
- Modify: `src/sqlite/getMemos.js`
- Modify: `src/sqlite/createMemo.js`
- Modify: `src/sqlite/updateMemo.js`
- Modify: `src/sqlite/deleteMemo.js`

各ファイルの先頭に`'use server'`を付け、関数を`async`にする。`db.run()`を`db.prepare().run()`に変更し、`saveDatabase()`呼び出しを削除する。

- [ ] **Step 1: getMemos.jsを書き換える**

`src/sqlite/getMemos.js` の内容を以下に置き換える:

```js
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
```

- [ ] **Step 2: createMemo.jsを書き換える**

`src/sqlite/createMemo.js` の内容を以下に置き換える:

```js
'use server'

import { getDatabase } from '../database/database'

/**
 * 新しいメモを追加するServer Action
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

- [ ] **Step 3: updateMemo.jsを書き換える**

`src/sqlite/updateMemo.js` の内容を以下に置き換える:

```js
'use server'

import { getDatabase } from '../database/database'

/**
 * メモを更新するServer Action
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

- [ ] **Step 4: deleteMemo.jsを書き換える**

`src/sqlite/deleteMemo.js` の内容を以下に置き換える:

```js
'use server'

import { getDatabase } from '../database/database'

/**
 * メモを削除するServer Action
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

- [ ] **Step 5: 構文チェック**

```bash
node --check src/sqlite/getMemos.js && node --check src/sqlite/createMemo.js && node --check src/sqlite/updateMemo.js && node --check src/sqlite/deleteMemo.js
```

Expected: エラーなし。

- [ ] **Step 6: Commit**

```bash
git add src/sqlite/
git commit -m "feat: convert SQLite functions to server actions"
```

---

### Task 4: app/layout.jsxとapp/page.jsxを作成

**Files:**
- Create: `app/layout.jsx`
- Create: `app/page.jsx`

- [ ] **Step 1: app/layout.jsxを作成する**

`app/layout.jsx` を新規作成:

```jsx
import '../src/App.css'

// ページ全体に反映されるメタデータ
export const metadata = {
  title: 'メモアプリ',
}

// 全ページ共通のルートレイアウト
// グローバルCSS（App.css）はこのルートレイアウトで読み込む
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
```

ポイント: 以前は`src/main.jsx`でApp.cssをimportしていたが、Next.jsではグローバルCSSをルートレイアウトで読み込む。

- [ ] **Step 2: app/page.jsxを作成する**

`app/page.jsx` を新規作成:

```jsx
import App from '../src/App'
import { getMemos } from '../src/sqlite/getMemos'

// 毎回サーバー側でレンダリングし、最新のDBデータを返す
// （これを付けないとビルド時に静的生成され、更新後のデータが反映されない）
export const dynamic = 'force-dynamic'

/**
 * ホームページ（Server Component）
 * サーバー側でSQLiteからメモ一覧を取得し、Client Component（App）へ渡す
 */
export default async function Page() {
  const memos = await getMemos()
  return <App initialMemos={memos} />
}
```

ポイント:
- Server ComponentからServer Action（`getMemos`）を直接呼び出せる
- `force-dynamic`で、ページリクエストのたびに最新データを取得する

- [ ] **Step 3: jsconfig.jsonを作成する**

`jsconfig.json` を新規作成:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

- [ ] **Step 4: .gitignoreにdata/を追加する**

`.gitignore` に `data` を追加し、以下の内容にする:

```
node_modules
dist
.DS_Store
*.local
data
```

- [ ] **Step 5: Commit**

```bash
git add app/ jsconfig.json .gitignore
git commit -m "feat: add Next.js app router pages"
```

---

### Task 5: src/App.jsxをClient Componentに変更

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: ファイルの内容を置き換える**

`src/App.jsx` の内容を以下に置き換える:

```jsx
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
```

ポイント:
- `'use client'`を先頭に付与（useStateを使うため）
- `initDatabase` / `isDbReady` / `useEffect` を削除。DB初期化はサーバー側で自動実行されるため
- `initialMemos`をpropsで受け取り、初期表示に使う
- 各ハンドラを`async`にし、Server Actionsを`await`で呼び出す

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: convert App to client component using server actions"
```

---

### Task 6: コンポーネントに'use client'を追加

**Files:**
- Modify: `src/components/MemoForm.jsx`
- Modify: `src/components/MemoList.jsx`

- [ ] **Step 1: MemoForm.jsxの先頭に'use client'を追加する**

`src/components/MemoForm.jsx` の先頭（1行目）に以下を追加:

```jsx
'use client'
```

つまり、ファイル先頭が以下のようになる:

```jsx
'use client'

import { useState } from 'react'

// ... 以下は既存の内容のまま
```

- [ ] **Step 2: MemoList.jsxの先頭に'use client'を追加する**

`src/components/MemoList.jsx` の先頭（1行目）に以下を追加:

```jsx
'use client'
```

つまり、ファイル先頭が以下のようになる:

```jsx
'use client'

import { useState } from 'react'

// ... 以下は既存の内容のまま
```

- [ ] **Step 3: Commit**

```bash
git add src/components/
git commit -m "feat: mark components as client components"
```

---

### Task 7: README.mdをNext.js向けに書き換え

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README.mdの内容を置き換える**

`README.md` の内容を以下に置き換える:

````markdown
# メモアプリ（Next.js + SQLite）

ハッカソン勉強会で使用するハンズオン用デモアプリです。

## 概要

Next.js（App Router）とSQLite（node:sqlite）を使用したメモアプリです。
データベースはサーバー側で動作し、ブラウザからはServer Actions経由で操作します。

## 機能

- メモの追加
- メモの一覧表示
- メモの編集
- メモの削除
- サーバー側SQLiteによるデータ永続化

## 技術スタック

- Next.js 15（App Router）
- React 19
- node:sqlite（Node.js組み込みのSQLite）

## 環境構築

### 前提条件

- Node.js 22.5以上（node:sqliteを使用するため）
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

## ディレクトリ構成

```
memo-demo/
├── package.json          # プロジェクト設定
├── jsconfig.json         # パスエイリアス設定
├── README.md             # このファイル
├── app/
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
| src/App.jsx | Client Component | use client |
| src/components/MemoForm.jsx | Client Component | use client |
| src/components/MemoList.jsx | Client Component | use client |
| src/database/database.js | Server専用 | なし |
| src/sqlite/*.js | Server Actions | use server |

- `use client`: ブラウザ側で動作するコンポーネント
- `use server`: サーバー側で動作し、ブラウザから直接呼び出せる関数

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
ホームページ（Server Component）。サーバー側でSQLiteからメモ一覧を取得し、Appコンポーネントへ渡します。

### src/App.jsx
メインコンポーネント（Client Component）。以下の責務を持ちます：
- メモ一覧の状態管理
- 各操作（追加・更新・削除）のハンドリング
- Server Actionsの呼び出し

### src/database/database.js
node:sqliteでデータベースファイルを開き、memoテーブルを作成します。初回呼び出し時に自動で初期化されます。

### src/components/MemoForm.jsx
メモ入力フォームコンポーネント。タイトルと内容を入力してメモを追加します。

### src/components/MemoList.jsx
メモ一覧表示コンポーネント。テーブル形式でメモを表示し、編集・削除機能を提供します。

### src/sqlite/createMemo.js
メモ追加のServer Action。INSERT文を使用して新しいメモをデータベースに追加します。

### src/sqlite/getMemos.js
メモ取得のServer Action。SELECT文を使用して全てのメモを取得します。

### src/sqlite/updateMemo.js
メモ更新のServer Action。UPDATE文を使用して既存のメモを更新します。

### src/sqlite/deleteMemo.js
メモ削除のServer Action。DELETE文を使用してメモを削除します。

## 学習ポイント

### Next.js
- Server ComponentとClient Componentの区別（use client）
- Server Actions（use server）
- サーバー側でのデータベースアクセス

### React
- useState: コンポーネントの状態管理
- プロパティによるコンポーネント間の通信
- イベントハンドリング

### SQLite
- CREATE TABLE: テーブル作成
- SELECT: データ取得
- INSERT: データ追加
- UPDATE: データ更新
- DELETE: データ削除
- プリペアドステートメント（SQLインジェクション防止）
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README for Next.js"
```

---

### Task 8: ビルド確認

**Files:**
- なし（検証のみ）

- [ ] **Step 1: 本番ビルドを実行する**

```bash
npm run build
```

Expected:
- `Compiled successfully` が表示される
- ルート（`/`）が dynamic として生成される
- `data/memo.db` はまだ作られない（force-dynamicのため）

もし `node:sqlite` 関連のバンドルエラーが出た場合は、`next.config.js` を新規作成して以下を設定する:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
}

export default nextConfig
```

ただし、`node:sqlite`はNode組み込みモジュールのため、通常は設定不要で通るはず。

- [ ] **Step 2: 開発サーバーで動作確認する**

```bash
npm run dev
```

別ターミナルで:

```bash
curl -s http://localhost:3000 | grep "メモアプリ"
```

Expected: `メモアプリ` が含まれるHTMLが返ってくる。開発サーバーのログに `データベースを開きました:` が表示される。`data/memo.db` が生成されている。

- [ ] **Step 3: CRUDの動作確認をユーザーに依頼する**

ブラウザで http://localhost:3000 を開き、以下を確認してもらう:
1. メモの追加（タイトル・内容を入力して「追加」）
2. 一覧表示（追加したメモが表示される）
3. 編集（「編集」→「保存」）
4. 削除（「削除」→確認ダイアログでOK）
5. ページリロード後もデータが残る
6. サーバー再起動（Ctrl+C→`npm run dev`）後もデータが残る

- [ ] **Step 4: 検証が通ったら最終コミット**

検証がすべて通ったら、未コミットの変更がないことを確認:

```bash
git status
```

（`data/memo.db` はgitignoreされているため表示されないこと）

---

## リスクと対策

- **node:sqliteのバンドル問題**: Next.jsが`node:sqlite`をサーバーバンドルで外部化できない場合は`next.config.js`で`serverExternalPackages`を設定する。Task 8のStep 1にフォールバック記載あり。
- **Nodeバージョン**: node:sqliteはNode 22.5+で利用可能。この環境はv24.7.0のため問題なし。READMEにも前提条件として記載済み。
