import type { NextApiRequest, NextApiResponse } from 'next'
import { withTokenRefresh } from '@/lib/withTokenRefresh'

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Task ID is required' })
  }

  return withTokenRefresh(req, res, async (token) => {
    return fetch(
      `${GATEWAY_URL}/presentation/api/v1/ppt/presentation/status/${encodeURIComponent(id)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
  })
}
