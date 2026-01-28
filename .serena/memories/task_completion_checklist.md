# ai-micro-front-sales Task Completion Checklist

## Before Completing Any Task

### 1. Code Quality
- [ ] TypeScriptエラーなし（`npm run type-check`）
- [ ] Lintエラーなし（`npm run lint`）
- [ ] 未使用のimport/変数を削除

### 2. Component Standards
- [ ] Props型が適切に定義されている
- [ ] ローディング状態の処理
- [ ] エラー状態の処理
- [ ] Radix UIコンポーネントの適切な使用

### 3. API Routes
- [ ] 適切なHTTPステータスコード
- [ ] エラーレスポンスの形式統一
- [ ] 認証チェック（必要な場合）
- [ ] httpOnly cookiesの適切な処理

### 4. UI/UX
- [ ] Tailwind CSSの一貫した使用
- [ ] レスポンシブデザイン対応
- [ ] トースト通知の適切な使用
- [ ] フォームバリデーション（Zod）

### 5. SWR Data Fetching
- [ ] 適切なキーの設定
- [ ] エラーハンドリング
- [ ] ローディング状態の表示
- [ ] データの再検証設定

### 6. Authentication
- [ ] 保護ページでの認証チェック
- [ ] トークン更新の処理
- [ ] ログアウト時のクリーンアップ

### 7. Sales API Integration
- [ ] プロキシ経由でのAPI呼び出し
- [ ] レスポンス型の適切な定義
- [ ] エラーメッセージの表示

## After Task Completion
- [ ] 開発サーバーで動作確認
- [ ] Sales API連携の確認
- [ ] 認証フローの確認
- [ ] Dockerビルドが成功するか確認
