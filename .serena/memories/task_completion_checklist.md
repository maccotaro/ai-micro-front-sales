# ai-micro-front-sales タスク完了チェックリスト

## コード変更後

### 1. 型チェック

```bash
npm run type-check
```
- 型エラーがないことを確認

### 2. Lint

```bash
npm run lint
```
- lintエラーがないことを確認

### 3. ファイルサイズ確認

```bash
wc -l src/**/*.{ts,tsx} | sort -n | tail -20
```
- 500行を超えるファイルがないことを確認

## ビルド確認

### 4. プロダクションビルド

```bash
npm run build
```
- ビルドエラーがないことを確認

### 5. 開発サーバーで動作確認

```bash
npm run dev
```
- 該当画面が正常に動作することを確認

## API変更時

### 6. API Route確認

- [ ] エラーハンドリングが適切か
- [ ] httpOnly cookieからトークンを正しく取得しているか
- [ ] バックエンドAPIへのプロキシが正しいか

## 新規画面追加時

### 7. 認証確認

- [ ] `useAuth` フックでログイン状態チェック
- [ ] 未ログイン時のリダイレクト処理

### 8. レイアウト確認

- [ ] `MainLayout` を使用しているか
- [ ] サイドバーにリンク追加が必要か

## ドキュメント更新

### 9. 必要に応じて更新

- [ ] `CLAUDE.md`: 新画面・新機能追加時
- [ ] 型定義: `src/types/index.ts`
- [ ] Serenaメモリ: 重要な変更時に `write_memory` で更新

## Dockerビルド

### 10. Docker確認

```bash
docker compose down
docker compose up -d --build
docker compose logs -f front-sales
```
- コンテナが正常に起動することを確認

## 関連サービス確認

### 11. 統合テスト

- [ ] `ai-micro-api-auth` が起動しているか
- [ ] `ai-micro-api-sales` が起動しているか
- [ ] 認証フローが正常に動作するか
- [ ] API呼び出しが正常にプロキシされるか
