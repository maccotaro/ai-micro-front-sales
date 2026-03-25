import type { NextApiRequest, NextApiResponse } from 'next'

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Build frontend URL dynamically from request headers
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:3005';
    const frontendUrl = `${proto}://${host}`;

    const response = await fetch(`${API_GATEWAY_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...req.body, frontend_url: frontendUrl }),
    })

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Forgot password proxy error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
