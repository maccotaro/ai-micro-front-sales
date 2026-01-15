import type { NextApiRequest, NextApiResponse } from 'next'

const SALES_API_URL = process.env.SALES_API_URL || 'http://localhost:8005'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path } = req.query
  const pathString = Array.isArray(path) ? path.join('/') : path || ''

  const accessToken = req.cookies.access_token

  if (!accessToken) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  try {
    const url = `${SALES_API_URL}/api/sales/${pathString}`

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    }

    if (req.body && req.method !== 'GET') {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    })

    const data = await response.json().catch(() => ({}))

    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Sales API proxy error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
