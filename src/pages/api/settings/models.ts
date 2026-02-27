/**
 * BFF API Route: AI Model Settings (Read-Only)
 *
 * GET /api/settings/models - api-admin からモデル一覧を取得
 *
 * front-sales は共通基盤データ（モデル設定）を api-admin から直接読み取る。
 * 将来 api-llm が実装された際に接続先を変更する。
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withTokenRefresh } from '@/lib/withTokenRefresh';

const ADMIN_API_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  return withTokenRefresh(req, res, async (token) => {
    return fetch(
      `${ADMIN_API_URL}/admin/settings/models/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  });
}
