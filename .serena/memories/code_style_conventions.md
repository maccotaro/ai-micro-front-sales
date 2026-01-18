# ai-micro-front-sales コードスタイル規約

## 基本規約

### ファイルサイズ制限
- **最大500行**（ドキュメント除く）
- 超過時は適切にコンポーネント分割

### TypeScript規約
- **バージョン**: TypeScript 5.7+
- **厳格モード**: `strict: true`
- **型注釈**: 必須（any禁止）
- **リンター**: ESLint (next/core-web-vitals)

### 命名規則

| 要素 | スタイル | 例 |
|------|---------|-----|
| コンポーネント | PascalCase | `MeetingCard.tsx` |
| ページ | kebab-case | `meeting-detail.tsx` |
| フック | camelCase + use接頭辞 | `useAuth.ts` |
| ユーティリティ | camelCase | `formatDate.ts` |
| 型 | PascalCase | `MeetingMinute` |
| 定数 | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |

### ディレクトリ規約

```
src/
├── pages/          # Next.js pages (自動ルーティング)
├── components/     # 共有コンポーネント
│   ├── layout/     # レイアウト系
│   └── ui/         # UIプリミティブ
├── hooks/          # カスタムフック
├── lib/            # ユーティリティ関数
└── types/          # 型定義
```

### コンポーネント規約

```tsx
import { FC } from 'react';

interface MeetingCardProps {
  meeting: MeetingMinute;
  onSelect?: (id: string) => void;
}

export const MeetingCard: FC<MeetingCardProps> = ({
  meeting,
  onSelect
}) => {
  return (
    <div onClick={() => onSelect?.(meeting.id)}>
      {meeting.company_name}
    </div>
  );
};
```

### API Route規約

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // 処理
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### インポート順序

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. サードパーティ
import { format } from 'date-fns';

// 3. UIコンポーネント
import { Button } from '@/components/ui/button';

// 4. ローカルモジュール
import { useAuth } from '@/hooks/use-auth';
import { MeetingMinute } from '@/types';
```

### Tailwind CSS規約

```tsx
// クラス名の順序：レイアウト → サイズ → 色 → その他
<div className="flex items-center gap-4 p-4 w-full bg-white rounded-lg shadow-sm">
```

### フォームバリデーション

```typescript
import { z } from 'zod';

export const meetingSchema = z.object({
  company_name: z.string().min(1, '会社名は必須です'),
  raw_text: z.string().min(10, '議事録内容は10文字以上必要です'),
  meeting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

type MeetingForm = z.infer<typeof meetingSchema>;
```
