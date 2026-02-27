import type { NextApiRequest, NextApiResponse } from 'next'
import { withTokenRefresh } from '@/lib/withTokenRefresh'

const SALES_API_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  return withTokenRefresh(req, res, async (token) => {
    const url = `${SALES_API_URL}/sales/meeting-minutes/${id}/chat/history`

    return fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  })
}
