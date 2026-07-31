# ハンズオンデモアプリ 開発仕様書（Next.js版）

## 1. 概要

本仕様書は、ハッカソン勉強会で使用するハンズオン用デモアプリの開発仕様を定義する。

本アプリは初心者向け教材として利用するため、設計の美しさや保守性よりも、

- 理解しやすい
- AIで実装しやすい
- ハッカソンでも応用しやすい

ことを重視する。

Next.jsで実装する。データベースはサーバー側のSQLite（node:sqlite）で動作させ、ブラウザからはServer Actions経由で操作する。

---

## 2. 開発目的

参加者が以下を学習できることを目的とする。

- Next.jsによる画面開発（App Router）
- Server Component / Client Component の区別（`use client`）
- Server Actions（`use server`）
- State管理
- Component分割
- SQLiteの基本的なCRUD操作
- サーバーサイドでのデータベース利用

今回はREST APIの設計・実装は扱わない（Server Actionsで代替する）。

---

## 3. 技術スタック

### Frontend

- Next.js（App Router）
- React
- JavaScript

### Database

- SQLite（node:sqlite）

node:sqliteはNode.js 22.5以降に組み込まれており、追加のインストールが不要。

---

## 4. 非採用技術

以下は使用しない。

- Vite
- sql.js
- LocalStorage
- TypeScript
- Redux
- Zustand
- Prisma
- REST API
- 認証
- デプロイ

---

## 5. 開発方針

初心者でも理解できるコードを最優先とする。

以下は禁止する。

- DDD
- Clean Architecture
- Repository Pattern
- 過度な抽象化
- カスタムHooks

コードの重複は許容する。

---

## 6. アプリ概要

メモアプリを作成する。

実装する機能

- メモ一覧表示
- メモ追加
- メモ編集
- メモ削除

画面は1ページのみとする。

---

## 7. 画面仕様

画面構成

```
------------------------------------------

メモアプリ

タイトル
[________________]

内容
[________________]

[追加]

------------------------------------------

メモ一覧

タイトル        本文          作成日時
[編集]          [削除]

------------------------------------------
```

ルーティングは使わず、ルート（/）の1ページのみとする。

---

## 8. データベース仕様

SQLiteを使用する。

データベースはサーバー上のファイルとして作成し、アプリ起動時にテーブルを生成する。

テーブル: memo

| カラム | 型 | 制約 |
| --- | --- | --- |
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| title | TEXT | NOT NULL |
| content | TEXT | NOT NULL |
| created_at | TEXT | NOT NULL |

---

## 9. データ保存

SQLiteデータベースはサーバー上のファイルに保存する。

ブラウザを閉じてもデータが残るよう、DBファイルをサーバーに保持する。

参加者がSQLを書かなくても動くようにせず、SQL文は明示的に記述する。

使用するSQL

- CREATE TABLE
- SELECT
- INSERT
- UPDATE
- DELETE

---

## 10. ディレクトリ構成

```
memo-demo/
  app/
    layout.jsx
    page.jsx
  src/
    App.jsx
    App.css
    database/
      database.js
    components/
      MemoForm.jsx
      MemoList.jsx
    sqlite/
      createMemo.js
      getMemos.js
      updateMemo.js
      deleteMemo.js
  data/
    memo.db
  package.json
  README.md
```

`data/memo.db` は実行時に生成されるため、gitignoreの対象とする。

---

## 11. クライアント/サーバーの区分

| ファイル | 区分 | ディレクティブ |
| --- | --- | --- |
| app/layout.jsx | Server Component | なし |
| app/page.jsx | Server Component | なし |
| src/App.jsx | Client Component | use client |
| src/components/MemoForm.jsx | Client Component | use client |
| src/components/MemoList.jsx | Client Component | use client |
| src/database/database.js | Server専用 | なし（サーバー側からのみimport） |
| src/sqlite/*.js | Server Actions | use server |

`use server` を付けた関数はブラウザから直接呼び出せるServer Actionsとなる。

---

## 12. データの流れ

### 初期表示

`app/page.jsx`（Server Component）が `getMemos()` を呼び出し、初期のメモ一覧を取得してClient Componentへpropsで渡す。

### 追加

`MemoForm` が `createMemo()`（Server Action）を呼び出し、サーバー側でINSERTを実行する。

### 更新・削除

`MemoList` が `updateMemo()` / `deleteMemo()`（Server Action）を呼び出し、サーバー側でUPDATE / DELETEを実行する。

---

## 13. SQLite実装方針

各ファイルは1機能のみ実装する。

例

- createMemo.js
- getMemos.js
- updateMemo.js
- deleteMemo.js

各ファイル内で

- SQL
- エラーハンドリング

まで完結させる。

---

## 14. React実装方針

使用するHooks

- useState
- useEffect

使用しないHooks

- useContext
- useReducer
- useMemo
- useCallback

状態管理ライブラリは禁止。

---

## 15. UI方針

CSSのみ使用する。

使用しないもの

- Bootstrap
- Tailwind CSS
- Material UI
- Ant Design

シンプルなデザインで十分とする。

---

## 16. エラーハンドリング

SQL実行に失敗した場合は

- console.error

を利用する。

ユーザーには簡単なエラーメッセージを表示する。

Server Action呼び出しの失敗（SQLエラー・ネットワークエラー）も同様に、console.errorとユーザーへの簡易メッセージ表示で対応する。

---

## 17. コメント

初心者向け教材であるため、

- React
- Next.js（use client / use server の解説）
- SQL
- 各関数

にはコメントを書くこと。

---

## 18. コーディング規約

- JavaScript（ES6）
- constを優先する
- 意味のある変数名を使用する
- インデントは2スペース
- 関数名は処理内容が分かる名前にする

---

## 19. 完成条件

以下を満たしたら完成とする。

- Next.jsで画面が表示される
- メモ追加ができる
- メモ一覧表示ができる
- メモ編集ができる
- メモ削除ができる
- サーバー側SQLiteへ保存される
- サーバー再起動後もデータが残る

---

## 20. AIへの実装指示

実装時は以下を厳守すること。

1. 初心者向け教材であることを最優先する。
2. Next.js（App Router）で実装する。
3. 画面のコンポーネントには `use client` を付与する。
4. SQLite操作の関数には `use server` を付与し、Server Actionsとして実装する。
5. データベースはnode:sqliteを使用し、サーバー側で動作させる。
6. SQLを直接記述し、ORMやラッパーライブラリは使用しない。
7. 複雑な設計パターンは採用しない。
8. 各機能は可能な限り独立したファイルに分割する。
9. コードの重複は許容する。
10. READMEを作成し、環境構築、起動方法、ディレクトリ構成、使用ライブラリ、各ファイルの役割を記載する。
11. すべてのソースコードには教材として理解しやすいコメントを付与する。
12. 第3回～第6回の勉強会で段階的に実装・解説できる構成とする。
