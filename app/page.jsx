import App from '../src/App'

// ホームページ（Server Component）
// データ取得はClient Component（App）がfetchで行う
export default function Page() {
  return <App />
}
