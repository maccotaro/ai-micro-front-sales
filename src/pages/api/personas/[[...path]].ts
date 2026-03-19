import type { NextApiRequest, NextApiResponse } from 'next'
import '@/lib/auth-init'
import { withTokenRefresh } from '@maccotaro/ai-micro-lib-frontend/auth'

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path, ...queryParams } = req.query
  const pathSegments = Array.isArray(path) ? path : path ? [path] : []
  const pathString = pathSegments.join('/')

  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(queryParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v))
    } else if (value != null) {
      qs.append(key, value)
    }
  }
  const queryString = qs.toString()

  return withTokenRefresh(req, res, async (token) => {
    const url = `${GATEWAY_URL}/admin/personas/${pathString}${queryString ? `?${queryString}` : ''}`

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
