import type { NextApiRequest, NextApiResponse } from 'next'
import { withTokenRefresh } from '@/lib/withTokenRefresh'

const ADMIN_API_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  return withTokenRefresh(req, res, async (token) => {
    const queryString = new URLSearchParams(
      req.query as Record<string, string>
    ).toString()
    const url = `${ADMIN_API_URL}/admin/knowledge-bases/${queryString ? `?${queryString}` : ''}`

    return fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  })
}
