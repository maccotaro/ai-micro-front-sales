/**
 * BFF API Route: AI Model Settings (Read-Only)
 *
 * GET /api/settings/models - api-admin からモデル一覧を取得
 *
 * front-sales は共通基盤データ（モデル設定）を api-admin から直接読み取る。
 * 将来 api-llm が実装された際に接続先を変更する。
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:8003';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // front-sales は access_token Cookie を使用（admin_access_token ではない）
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch(
      `${ADMIN_API_URL}/admin/settings/models/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Model settings API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
