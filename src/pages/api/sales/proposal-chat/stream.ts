import type { NextApiRequest, NextApiResponse } from 'next'

const SALES_API_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const accessToken = req.cookies.access_token

  if (!accessToken) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  try {
    const url = `${SALES_API_URL}/sales/proposal-chat/stream`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return res.status(response.status).json(errorData)
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    // Stream the response
    const reader = response.body?.getReader()
    if (!reader) {
      return res.status(500).json({ message: 'No response body' })
    }

    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      res.write(chunk)
    }

    res.end()
  } catch (error) {
    console.error('Proposal chat stream error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
