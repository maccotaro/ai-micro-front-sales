import type { NextApiRequest, NextApiResponse } from 'next'

const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'http://localhost:8002'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const accessToken = req.cookies.access_token

    if (!accessToken) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const response = await fetch(`${AUTH_SERVER_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const user = await response.json()
    return res.status(200).json(user)
  } catch (error) {
    console.error('Get user error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
