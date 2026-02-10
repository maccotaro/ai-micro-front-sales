# ai-micro-front-sales プロジェクト概要

## サービス概要
営業支援AIフロントエンド。議事録管理、AI分析、提案書生成、シミュレーション、提案チャットを提供。

## サービス詳細
- **ポート**: 3005
- **Framework**: Next.js 15 (Pages Router), TypeScript
- **UI**: Tailwind CSS, Radix UI, SWR, React Hook Form + Zod

## 主要ページ
- /meetings - 議事録管理・AI分析
- /meetings/[id] - 議事録詳細・AI解析・提案生成
- /proposals - 提案書管理・フィードバック
- /simulation - コスト見積・ROI
- /search - 類似検索（ベクトル）
- /graph - Neo4jグラフ推薦
- /proposal-chat - 商材提案チャット
  - パイプラインセレクター (V1/V2, localStorage永続化)
  - チャットモデルセレクター (api-adminから取得, chatカテゴリフィルタ)
  - SSEストリーミング提案生成
- /dashboard - ダッシュボード

## BFF API Routes
- /api/auth/* → api-auth
- /api/sales/* → api-sales (catch-all proxy)
- /api/settings/models → api-admin /admin/settings/models/

## 環境変数
- AUTH_SERVER_URL, SALES_API_URL, ADMIN_API_URL, JWT_SECRET
