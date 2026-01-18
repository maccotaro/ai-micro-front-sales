import type { NextApiRequest, NextApiResponse } from 'next'

const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'http://localhost:8002'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const refreshToken = req.cookies.refresh_token

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
      // Clear invalid cookies
      res.setHeader('Set-Cookie', [
        'access_token=; Path=/; HttpOnly; Max-Age=0',
        'refresh_token=; Path=/; HttpOnly; Max-Age=0',
      ])
      return res.status(401).json({ message: 'Token refresh failed' })
    }

    // Update cookies with new tokens
    const cookieOptions = [
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ].filter(Boolean).join('; ')

    res.setHeader('Set-Cookie', [
      `access_token=${data.access_token}; ${cookieOptions}; Max-Age=900`,
      `refresh_token=${data.refresh_token}; ${cookieOptions}; Max-Age=604800`,
    ])

    return res.status(200).json(data)
  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
