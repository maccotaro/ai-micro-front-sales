import type { NextApiRequest, NextApiResponse } from 'next'
import { withTokenRefresh } from '@/lib/withTokenRefresh'

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { tenant_id } = req.body
  if (!tenant_id) {
    return res.status(400).json({ message: 'tenant_id is required' })
  }

  return withTokenRefresh(req, res, async (token) => {
    return fetch(`${API_GATEWAY_URL}/auth/switch-tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tenant_id }),
    })
  })
}
