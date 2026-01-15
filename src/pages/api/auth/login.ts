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
    const { email, password } = req.body

    const response = await fetch(`${AUTH_SERVER_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    // Set httpOnly cookies
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

    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
