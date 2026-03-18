import type { NextApiRequest, NextApiResponse } from 'next'
import '@/lib/auth-init'
import { withTokenRefresh, getValidToken, tryRefreshOnError } from '@maccotaro/ai-micro-lib-frontend/auth'

const SALES_API_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

// SSE uses direct connection to api-sales to avoid gateway buffering.
const SALES_SSE_URL = process.env.SALES_API_URL || SALES_API_URL

// SSEストリーミングが必要なエンドポイント
const SSE_ENDPOINTS = ['proposal-chat/stream', 'proposal-pipeline/stream']

// バイナリダウンロードエンドポイント（JSONパースをスキップ）
const BINARY_ENDPOINTS = ['export/download']

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
  const { path, ...queryParams } = req.query
  const pathString = Array.isArray(path) ? path.join('/') : path || ''

  // Build query string from remaining query params (excluding path segments)
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(queryParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v))
    } else if (value != null) {
      qs.append(key, value)
    }
  }
  const queryString = qs.toString()

  const isSSE = SSE_ENDPOINTS.some((endpoint) => pathString.includes(endpoint))
  const isBinary = BINARY_ENDPOINTS.some((endpoint) => pathString.includes(endpoint))

  if (isBinary) {
    // Binary download: get a valid token (refresh if needed)
    const accessToken = await getValidToken(req, res)
    if (!accessToken) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    try {
      const url = `${SALES_SSE_URL}/api/sales/${pathString}${queryString ? `?${queryString}` : ''}`
      let response = await fetch(url, {
        method: req.method,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      // Retry once on 401/403
      if (response.status === 401 || response.status === 403) {
        const newToken = await tryRefreshOnError(req, res, response.status)
        if (newToken) {
          response = await fetch(url, {
            method: req.method,
            headers: { Authorization: `Bearer ${newToken}` },
          })
        }
      }

      if (!response.ok) {
        return res.status(response.status).json({ detail: response.statusText })
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream'
      const contentDisposition = response.headers.get('content-disposition') || ''

      res.setHeader('Content-Type', contentType)
      if (contentDisposition) {
        res.setHeader('Content-Disposition', contentDisposition)
      }

      const buffer = await response.arrayBuffer()
      res.status(200).send(Buffer.from(buffer))
      return
    } catch (error) {
      console.error('Binary proxy error:', error)
      return res.status(500).json({ message: 'Download failed' })
    }
  }

  if (isSSE) {
    // SSE streaming: get a valid token (refresh if needed)
    const accessToken = await getValidToken(req, res)
    if (!accessToken) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    try {
      // Direct connection to api-sales: use /api/sales/ prefix (not /sales/ gateway prefix)
      const url = `${SALES_SSE_URL}/api/sales/${pathString}${queryString ? `?${queryString}` : ''}`

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
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        })

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            res.write(decoder.decode(value, { stream: true }))
            if (typeof (res as any).flush === 'function') {
              ;(res as any).flush()
            }
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
    const url = `${SALES_API_URL}/sales/${pathString}${queryString ? `?${queryString}` : ''}`

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
