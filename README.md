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
