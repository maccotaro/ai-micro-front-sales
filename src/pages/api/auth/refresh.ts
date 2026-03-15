import type { NextApiRequest, NextApiResponse } from 'next'
import { REFRESH_TOKEN_COOKIE, setTokenCookies } from '@/lib/cookies'

const AUTH_SERVER_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE]

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' })
    }

    const response = await fetch(`${AUTH_SERVER_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ message: 'リクエストが多すぎます。しばらくしてから再度お試しください。' })
      }
      // Do NOT clear cookies here — a concurrent refresh may have already
      // rotated the token. Clearing would destroy the valid new token.
      // The client-side useAuth handles redirect to /login if needed.
      return res.status(401).json({ message: 'Token refresh failed' })
    }

    setTokenCookies(res, data.access_token, data.refresh_token)

    return res.status(200).json(data)
  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
