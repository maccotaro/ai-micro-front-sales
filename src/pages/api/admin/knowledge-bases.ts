import type { NextApiRequest, NextApiResponse } from 'next'

const ADMIN_API_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const accessToken = req.cookies.access_token

  if (!accessToken) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  try {
    // Forward query parameters
    const queryString = new URLSearchParams(
      req.query as Record<string, string>
    ).toString()
    const url = `${ADMIN_API_URL}/admin/knowledge-bases${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const data = await response.json().catch(() => ({}))

    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Admin API proxy error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
