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
