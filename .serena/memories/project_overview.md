# ai-micro-front-sales プロジェクト概要

## 目的
営業支援AIサービス フロントエンド。議事録管理、AI解析、提案書生成、シミュレーション機能を提供するBFFアプリケーション。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Framework | Next.js 15 (Pages Router) |
| Language | TypeScript 5.7 |
| React | 19.0 |
| Styling | Tailwind CSS 3.4 |
| UI Components | Radix UI |
| Data Fetching | SWR 2.2 |
| Form | React Hook Form + Zod |
| 認証 | JWT (httpOnly cookies) |

## サービス通信

```
ai-micro-front-sales (Port 3005)
    ↓
ai-micro-api-auth (Port 8002)  ← JWT認証
    ↓
ai-micro-api-sales (Port 8005)  ← Sales API
    ↓
ai-micro-api-admin (Port 8003)  ← マスタデータ参照
```

## ディレクトリ構造

```
ai-micro-front-sales/
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/           # 認証API routes
│   │   │   └── sales/          # Sales APIプロキシ
│   │   ├── meetings/           # 議事録管理
│   │   ├── proposals/          # 提案書管理
│   │   ├── simulation.tsx      # シミュレーション
│   │   ├── search.tsx          # 類似検索
│   │   ├── graph.tsx           # グラフベース推薦
│   │   └── dashboard.tsx       # ダッシュボード
│   ├── components/
│   │   ├── layout/             # レイアウト
│   │   └── ui/                 # UIコンポーネント
│   ├── hooks/                  # カスタムフック
│   ├── lib/                    # ユーティリティ
│   ├── types/                  # 型定義
│   └── styles/                 # スタイル
├── Dockerfile
├── docker-compose.yml
└── package.json
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

## 主要機能

1. **議事録管理**: CRUD、AI解析、提案書自動生成
2. **提案書管理**: 一覧・詳細表示、フィードバック送信
3. **シミュレーション**: コスト試算、キャンペーン適用、ROI予測
4. **類似検索**: 議事録/成功事例/セールストーク/商品検索
5. **グラフベース推薦**: Neo4j接続、グラフ統計、推薦取得

## 認証フロー

1. `/login` でログイン
2. BFF → `ai-micro-api-auth` にリクエスト
3. JWT トークンを httpOnly cookies に保存
4. 以降のリクエストは自動的にトークン付与
5. トークン期限切れ時は自動更新

## ポート
- **Port**: 3005
- **コンテナ名**: ai-micro-front-sales
