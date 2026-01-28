# ai-micro-front-sales Suggested Commands

## Development
```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# Lint
npm run lint

# ビルド
npm run build
```

## Docker Operations
```bash
# コンテナ起動
cd ai-micro-front-sales && docker compose up -d

# ビルドと起動
docker compose up -d --build

# ログ確認
docker compose logs -f front-sales

# コンテナ再起動
docker compose restart

# 停止
docker compose down
```

## Testing
```bash
# テスト実行（設定されている場合）
npm run test
```

## Troubleshooting
```bash
# node_modulesクリア＆再インストール
rm -rf node_modules && npm install

# Next.jsキャッシュクリア
rm -rf .next

# Dockerイメージ再ビルド
docker compose up -d --build
```

## Environment
- **開発URL**: http://localhost:3005
- **Backend APIs**:
  - Sales API: http://localhost:8005
  - Auth API: http://localhost:8002
  - Admin API: http://localhost:8003
