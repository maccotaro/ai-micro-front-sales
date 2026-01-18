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
    const accessToken = req.cookies.access_token

    if (accessToken) {
      // Call auth service to invalidate token
      await fetch(`${AUTH_SERVER_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => {
        // Ignore errors from auth service
      })
    }

    // Clear cookies
    res.setHeader('Set-Cookie', [
      'access_token=; Path=/; HttpOnly; Max-Age=0',
      'refresh_token=; Path=/; HttpOnly; Max-Age=0',
    ])

    return res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
