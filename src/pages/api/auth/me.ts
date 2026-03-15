import type { NextApiRequest, NextApiResponse } from 'next'
import { ACCESS_TOKEN_COOKIE } from '@/lib/cookies'

const AUTH_SERVER_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const token = req.cookies[ACCESS_TOKEN_COOKIE]

  if (!token) {
    return res.status(401).json({ error: 'No access token' })
  }

  try {
    const response = await fetch(`${AUTH_SERVER_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      // Return the status as-is — client-side useAuth handles refresh
      const data = await response.json().catch(() => ({ error: response.statusText }))
      return res.status(response.status).json(data)
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Auth me error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
