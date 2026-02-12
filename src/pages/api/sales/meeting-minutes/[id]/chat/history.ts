import type { NextApiRequest, NextApiResponse } from 'next'

const SALES_API_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  const accessToken = req.cookies.access_token

  if (!accessToken) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  try {
    const url = `${SALES_API_URL}/sales/meeting-minutes/${id}/chat/history`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const data = await response.json().catch(() => ({}))
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Chat history error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
