# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) へのガイダンスを提供します。

## プロジェクト概要

**ai-micro-front-sales** - 営業支援AIサービス フロントエンド

議事録管理、AI解析、提案書生成、シミュレーション機能を提供するNext.jsベースのフロントエンドアプリケーションです。

## アーキテクチャ

### サービス構成

```
ai-micro-front-sales (Port 3005)
    ↓
ai-micro-api-auth (Port 8002)  ← JWT認証
    ↓
ai-micro-api-sales (Port 8005)  ← Sales API
    ↓
ai-micro-api-admin (Port 8003)  ← マスタデータ参照
```

### 技術スタック

- **フレームワーク**: Next.js 15 (Pages Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: Radix UI
- **データフェッチ**: SWR
- **フォーム**: React Hook Form + Zod
- **認証**: JWT (httpOnly cookies)

## ディレクトリ構造

```
ai-micro-front-sales/
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/           # 認証API routes
│   │   │   │   ├── login.ts
│   │   │   │   ├── logout.ts
│   │   │   │   ├── me.ts
│   │   │   │   └── refresh.ts
│   │   │   ├── sales/          # Sales APIプロキシ
│   │   │   │   └── [...path].ts
│   │   │   └── health.ts
│   │   ├── meetings/           # 議事録管理
│   │   │   ├── index.tsx       # 一覧
│   │   │   ├── new.tsx         # 新規作成
│   │   │   └── [id].tsx        # 詳細・解析
│   │   ├── proposals/          # 提案書管理
│   │   │   ├── index.tsx       # 一覧
│   │   │   └── [id].tsx        # 詳細・フィードバック
│   │   ├── simulation.tsx      # シミュレーション
│   │   ├── search.tsx          # 類似検索
│   │   ├── graph.tsx           # グラフベース推薦
│   │   ├── dashboard.tsx       # ダッシュボード
│   │   ├── login.tsx           # ログイン
│   │   ├── index.tsx           # リダイレクト
│   │   ├── _app.tsx
│   │   └── _document.tsx
│   ├── components/
│   │   ├── layout/             # レイアウト
│   │   │   ├── sidebar.tsx
│   │   │   └── main-layout.tsx
│   │   └── ui/                 # UIコンポーネント
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── label.tsx
│   │       ├── badge.tsx
│   │       ├── tabs.tsx
│   │       ├── toast.tsx
│   │       └── toaster.tsx
│   ├── hooks/
│   │   ├── use-auth.ts         # 認証フック
│   │   └── use-toast.ts        # トーストフック
│   ├── lib/
│   │   ├── auth.ts             # 認証ユーティリティ
│   │   ├── api.ts              # APIクライアント
│   │   └── utils.ts            # ユーティリティ
│   ├── types/
│   │   └── index.ts            # 型定義
│   └── styles/
│       └── globals.css         # グローバルスタイル
├── public/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

## 画面一覧

| パス | 画面名 | 説明 |
|------|--------|------|
| `/login` | ログイン | 認証画面 |
| `/dashboard` | ダッシュボード | メイン画面 |
| `/meetings` | 議事録一覧 | 議事録の一覧表示 |
| `/meetings/new` | 議事録作成 | 新規議事録作成 |
| `/meetings/[id]` | 議事録詳細 | 詳細・AI解析・提案生成 |
| `/proposals` | 提案書一覧 | 提案書の一覧表示 |
| `/proposals/[id]` | 提案書詳細 | 詳細・フィードバック |
| `/simulation` | シミュレーション | コスト試算・ROI計算 |
| `/search` | 類似検索 | ベクトル類似検索 |
| `/graph` | グラフ推薦 | Neo4jベース推薦 |

## API Routes

### 認証 (`/api/auth/`)

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/login` | ログイン |
| POST | `/logout` | ログアウト |
| GET | `/me` | 現在のユーザー取得 |
| POST | `/refresh` | トークン更新 |

### Sales APIプロキシ (`/api/sales/`)

すべてのリクエストを `ai-micro-api-sales` にプロキシ:

- `/api/sales/meeting-minutes/*`
- `/api/sales/proposals/*`
- `/api/sales/simulation/*`
- `/api/sales/search/*`
- `/api/sales/graph/*`

## 一般的なコマンド

### 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 型チェック
npm run type-check

# Lint
npm run lint

# ビルド
npm run build
```

### Docker

```bash
# ビルドと起動
docker compose up -d --build

# ログ表示
docker compose logs -f front-sales

# 停止
docker compose down
```

## 環境変数

```bash
# Authentication Service
AUTH_SERVER_URL=http://localhost:8002

# Sales API Service
SALES_API_URL=http://localhost:8005

# Admin API Service (for master data)
ADMIN_API_URL=http://localhost:8003

# JWT Settings
JWT_SECRET=your-jwt-secret-key-change-in-production
```

## 主要機能

### 1. 議事録管理

- 議事録のCRUD操作
- AI解析の実行（課題・ニーズ抽出）
- 解析結果の表示
- 提案書の自動生成

### 2. 提案書管理

- 提案書の一覧・詳細表示
- 推奨商品・トークポイント・反論対応の表示
- フィードバック（採用/却下/修正要）の送信

### 3. シミュレーション

- 詳細シミュレーション（地域・業界・規模考慮）
- 簡易見積もり
- キャンペーン適用
- ROI予測

### 4. 類似検索

- 議事録検索
- 成功事例検索
- セールストーク検索
- 商品検索

### 5. グラフベース推薦

- Neo4j接続状態表示
- グラフ統計情報
- 議事録に対する推薦取得

## 認証フロー

1. ユーザーが `/login` でログイン
2. BFFが `ai-micro-api-auth` にリクエスト
3. JWT トークンを httpOnly cookies に保存
4. 以降のリクエストは自動的にトークンを付与
5. トークン期限切れ時は自動更新

## セキュリティ

- httpOnly cookies でトークン管理
- CSRF対策（SameSite=Lax）
- BFFパターンによるAPIプロキシ
- 環境変数による機密情報管理

## 関連サービス

- **ai-micro-api-sales**: Sales API（バックエンド）
- **ai-micro-api-auth**: 認証サービス
- **ai-micro-api-admin**: 管理API（マスタデータ）
- **ai-micro-neo4j**: グラフデータベース

---

**作成日**: 2025-12-18
**バージョン**: 1.0.0
