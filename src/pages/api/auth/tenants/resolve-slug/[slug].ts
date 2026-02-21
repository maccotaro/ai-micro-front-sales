import type { NextApiRequest, NextApiResponse } from 'next'

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { slug } = req.query

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ message: 'Slug is required' })
    }

    const response = await fetch(
      `${API_GATEWAY_URL}/auth/tenants/resolve-slug/${encodeURIComponent(slug)}`
    )

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ message: 'Tenant not found' })
      }
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      return res.status(response.status).json(errorData)
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Resolve slug error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
