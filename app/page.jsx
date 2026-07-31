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
