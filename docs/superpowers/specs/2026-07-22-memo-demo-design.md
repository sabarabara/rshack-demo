# ハンズオンデモアプリ 開発仕様書（React単体版）

## 1. 概要

本仕様書は、ハッカソン勉強会で使用するハンズオン用デモアプリの開発仕様を定義する。

本アプリは初心者向け教材として利用するため、設計の美しさや保守性よりも、

- 理解しやすい
- AIで実装しやすい
- ハッカソンでも応用しやすい

ことを重視する。

Reactのみで実装し、バックエンドは作成しない。

データはブラウザ上で完結し、SQLiteをWebAssembly版（sql.js）としてブラウザ内で利用する。

---

## 2. 開発目的

参加者が以下を学習できることを目的とする。

- Reactによる画面開発
- State管理
- Component分割
- SQLiteの基本的なCRUD操作
- データベースを利用したWebアプリ開発

今回はサーバーサイドやREST APIは扱わない。

---

## 3. 技術スタック

### Frontend

- React
- JavaScript
- Vite

### Database

- SQLite（sql.js）

ブラウザ内でSQLiteを動作させる。

---

## 4. 非採用技術

以下は使用しない。

- Node.js（バックエンド）
- Express
- Firebase
- Next.js
- TypeScript
- Redux
- Zustand
- Prisma
- Docker
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

React Routerは使用しない。

---

## 8. データベース仕様

SQLiteを使用する。

ブラウザ起動時にデータベースを生成する。

テーブル: memo

| カラム | 型 | 制約 |
| --- | --- | --- |
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| title | TEXT | NOT NULL |
| content | TEXT | NOT NULL |
| created_at | TEXT | NOT NULL |

---

## 9. データ保存

SQLiteデータベースはブラウザ上で保持する。

ブラウザを閉じてもデータが残るよう、データベースをLocalStorageへ保存・復元する。

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
  src/
    App.jsx
    main.jsx
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
  public/
  package.json
  README.md
```

---

## 11. SQLite実装方針

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

## 12. React実装方針

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

## 13. UI方針

CSSのみ使用する。

使用しないもの

- Bootstrap
- Tailwind CSS
- Material UI
- Ant Design

シンプルなデザインで十分とする。

---

## 14. エラーハンドリング

SQL実行に失敗した場合は

- console.error

を利用する。

ユーザーには簡単なエラーメッセージを表示する。

---

## 15. コメント

初心者向け教材であるため、

- React
- SQL
- 各関数

にはコメントを書くこと。

---

## 16. コーディング規約

- JavaScript（ES6）
- constを優先する
- 意味のある変数名を使用する
- インデントは2スペース
- 関数名は処理内容が分かる名前にする

---

## 17. 完成条件

以下を満たしたら完成とする。

- Reactで画面が表示される
- メモ追加ができる
- メモ一覧表示ができる
- メモ編集ができる
- メモ削除ができる
- SQLiteへ保存される
- LocalStorageから復元される
- ブラウザ再読み込み後もデータが残る

---

## 18. AIへの実装指示

実装時は以下を厳守すること。

1. 初心者向け教材であることを最優先する。
2. Reactのみで完結する構成にする。
3. バックエンドは作成しない。
4. SQLを直接記述し、ORMやラッパーライブラリは使用しない。
5. SQLiteはsql.jsを利用し、ブラウザ内で動作させる。
6. SQLiteデータはLocalStorageへ保存・復元できるようにする。
7. 複雑な設計パターンは採用しない。
8. 各機能は可能な限り独立したファイルに分割する。
9. コードの重複は許容する。
10. READMEを作成し、環境構築、起動方法、ディレクトリ構成、使用ライブラリ、各ファイルの役割を記載する。
11. すべてのソースコードには教材として理解しやすいコメントを付与する。
12. 第3回～第6回の勉強会で段階的に実装・解説できる構成とする。
