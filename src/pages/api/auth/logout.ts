import type { NextApiRequest, NextApiResponse } from 'next'
import { ACCESS_TOKEN_COOKIE, clearTokenCookies } from '@/lib/cookies'

const AUTH_SERVER_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const accessToken = req.cookies[ACCESS_TOKEN_COOKIE]

    if (accessToken) {
      await fetch(`${AUTH_SERVER_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => {})
    }

    clearTokenCookies(res)

    return res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
