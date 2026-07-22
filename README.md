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
