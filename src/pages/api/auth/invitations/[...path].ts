import type { NextApiRequest, NextApiResponse } from 'next'

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

/**
 * Public proxy for invitation verification.
 *   GET /api/auth/invitations/verify/{token} -> GET /auth/invitations/{token}
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pathSegments = Array.isArray(req.query.path) ? req.query.path : [req.query.path || '']

  if (pathSegments[0] === 'verify' && pathSegments[1] && req.method === 'GET') {
    const token = pathSegments[1]
    try {
      const response = await fetch(`${API_GATEWAY_URL}/auth/invitations/${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json().catch(() => ({}))
      return res.status(response.status).json(data)
    } catch (error) {
      console.error('Invitation verify proxy error:', error)
      return res.status(500).json({ error: 'サーバーエラーが発生しました' })
    }
  }

  return res.status(404).json({ error: 'Not found' })
}
