# ai-micro-front-sales Project Overview

## Purpose
営業支援AIサービスのフロントエンドアプリケーション。議事録管理、AI解析、提案書生成、シミュレーション機能を提供。

## Technology Stack
- **Framework**: Next.js 15 (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Data Fetching**: SWR
- **Form**: React Hook Form + Zod
- **Authentication**: JWT (httpOnly cookies)

## Architecture
```
ai-micro-front-sales (Port 3005)
    ↓
ai-micro-api-auth (Port 8002)  ← JWT認証
    ↓
ai-micro-api-sales (Port 8005)  ← Sales API
    ↓
ai-micro-api-admin (Port 8003)  ← マスタデータ参照
```

## Key Features
1. **議事録管理**: CRUD、AI解析、提案書生成
2. **提案書管理**: 一覧・詳細、フィードバック機能
3. **シミュレーション**: コスト試算、ROI計算
4. **類似検索**: ベクトル類似検索
5. **グラフ推薦**: Neo4jベース推薦

## Main Pages
| Path | Description |
|------|-------------|
| `/dashboard` | メインダッシュボード |
| `/meetings` | 議事録一覧・詳細・AI解析 |
| `/proposals` | 提案書一覧・詳細・フィードバック |
| `/simulation` | コスト試算・ROI計算 |
| `/search` | ベクトル類似検索 |
| `/graph` | Neo4jベース推薦 |

## Port Configuration
- **Development**: http://localhost:3005
- **Docker**: ポート3005

## Backend Dependencies
- ai-micro-api-sales (Port 8005): Sales API
- ai-micro-api-auth (Port 8002): 認証サービス
- ai-micro-api-admin (Port 8003): マスタデータ
- ai-micro-neo4j: グラフデータベース
