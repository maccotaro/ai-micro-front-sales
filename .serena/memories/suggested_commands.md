# ai-micro-front-sales 推奨コマンド

## 開発

### 依存関係インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
# http://localhost:3005 でアクセス可能
```

### 型チェック

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

### ビルド

```bash
npm run build
```

### 本番サーバー起動

```bash
npm run start
```

## Docker操作

### ビルドと起動

```bash
docker compose up -d --build
```

### ログ表示

```bash
docker compose logs -f front-sales
```

### 停止

```bash
docker compose down
```

### リビルド

```bash
docker compose down
docker compose up -d --build
```

## トラブルシューティング

### node_modules問題

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript型エラー

```bash
npm run type-check
# エラー内容を確認し修正
```

### 環境変数確認

```bash
# .env.local の内容確認
cat .env.local
```

## 関連サービス起動

```bash
# 認証サービス
cd ../ai-micro-api-auth && docker compose up -d

# Sales API
cd ../ai-micro-api-sales && docker compose up -d

# Admin API
cd ../ai-micro-api-admin && docker compose up -d
```

## Git操作

```bash
# ステータス確認
git status

# 差分確認
git diff

# コミット
git add . && git commit -m "feat: 機能追加"
```
