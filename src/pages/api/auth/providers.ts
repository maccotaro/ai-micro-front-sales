import type { NextApiRequest, NextApiResponse } from 'next'

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const params = new URLSearchParams()
    if (req.query.tenant_id) {
      params.set('tenant_id', String(req.query.tenant_id))
    }

    const url = `${API_GATEWAY_URL}/auth/providers${params.toString() ? `?${params}` : ''}`
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('Failed to fetch providers:', error)
    return res.status(500).json({ message: 'プロバイダー情報の取得に失敗しました' })
  }
}
