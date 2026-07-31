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
