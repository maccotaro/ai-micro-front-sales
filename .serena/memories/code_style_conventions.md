# ai-micro-front-sales Code Style Conventions

## TypeScript Standards
- 厳格な型定義を使用
- 型定義は`types/index.ts`に集約
- Zodによるランタイム検証

## Component Patterns
- 関数コンポーネント（アロー関数）
- Props型は`ComponentNameProps`形式
- PascalCase（コンポーネント）、camelCase（変数・関数）

## Directory Structure
```
src/
├── pages/           # Pages Router
│   ├── api/         # API Routes（BFFプロキシ）
│   │   ├── auth/    # 認証エンドポイント
│   │   └── sales/   # Sales APIプロキシ
│   └── ...          # ページコンポーネント
├── components/
│   ├── layout/      # レイアウトコンポーネント
│   └── ui/          # Radix UIベースコンポーネント
├── hooks/           # カスタムフック
├── lib/             # ユーティリティ
├── types/           # 型定義
└── styles/          # グローバルスタイル
```

## API Route Conventions
- `/api/auth/*`: 認証関連
- `/api/sales/[...path]`: Sales APIへのプロキシ
- httpOnly cookiesでJWT管理

## Data Fetching
- SWRによるデータフェッチ
- カスタムフック（`use-auth.ts`）で認証状態管理

## UI Components
- Radix UIプリミティブを使用
- Tailwind CSSでスタイリング
- cn()ユーティリティでクラス結合

## Import Order
1. React/Next.js
2. 外部ライブラリ（SWR, Radix UI等）
3. 内部モジュール
4. 型定義
5. スタイル
