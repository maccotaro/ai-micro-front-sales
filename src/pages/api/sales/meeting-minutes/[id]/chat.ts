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
  const { id } = req.query
  const accessToken = req.cookies.access_token

  if (!accessToken) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  if (req.method === 'POST') {
    // Streaming chat request
    try {
      const url = `${SALES_API_URL}/sales/meeting-minutes/${id}/chat`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }))
        return res.status(response.status).json(error)
      }

      // Set headers for SSE - disable all buffering and compression
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache, no-transform')
      res.setHeader('Connection', 'keep-alive')
      res.setHeader('X-Accel-Buffering', 'no')
      res.setHeader('Content-Encoding', 'none')
      res.setHeader('Transfer-Encoding', 'chunked')

      // Stream the response
      const reader = response.body?.getReader()
      if (!reader) {
        return res.status(500).json({ message: 'No response body' })
      }

      const decoder = new TextDecoder()

      // Flush headers immediately to start streaming
      res.flushHeaders()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          res.write(text)
          // Force flush for each chunk
          if (typeof (res as any).flush === 'function') {
            (res as any).flush()
          }
        }
      } finally {
        reader.releaseLock()
      }

      res.end()
    } catch (error) {
      console.error('Chat streaming error:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    // Clear chat history
    try {
      const url = `${SALES_API_URL}/sales/meeting-minutes/${id}/chat`

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = await response.json().catch(() => ({}))
      return res.status(response.status).json(data)
    } catch (error) {
      console.error('Chat delete error:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }
}
