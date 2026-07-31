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
