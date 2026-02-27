import type { NextApiRequest, NextApiResponse } from 'next'
import { withTokenRefresh } from '@/lib/withTokenRefresh'

const SALES_API_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

// SSEストリーミングが必要なエンドポイント
const SSE_ENDPOINTS = ['proposal-chat/stream', 'proposal-pipeline/stream']

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
  const { path } = req.query
  const pathString = Array.isArray(path) ? path.join('/') : path || ''

  const isSSE = SSE_ENDPOINTS.some((endpoint) => pathString.includes(endpoint))

  if (isSSE) {
    // SSE streaming: handle auth manually, skip withTokenRefresh
    const accessToken = req.cookies.access_token
    if (!accessToken) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    try {
      const url = `${SALES_API_URL}/sales/${pathString}`

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

      if (response.ok && response.body) {
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no')

        const reader = response.body.getReader()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            res.write(chunk)
          }
        } finally {
          reader.releaseLock()
          res.end()
        }
        return
      }

      // Non-OK SSE response
      const data = await response.json().catch(() => ({}))
      return res.status(response.status).json(data)
    } catch (error) {
      console.error('Sales API proxy error:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Non-SSE: use withTokenRefresh for automatic retry
  return withTokenRefresh(req, res, async (token) => {
    const url = `${SALES_API_URL}/sales/${pathString}`

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    }

    if (req.body && req.method !== 'GET') {
      headers['Content-Type'] = 'application/json'
    }

    return fetch(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    })
  })
}
