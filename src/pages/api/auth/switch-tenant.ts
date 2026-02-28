import type { NextApiRequest, NextApiResponse } from 'next'

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const accessToken = req.cookies.access_token

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token' })
    }

    const { tenant_id } = req.body
    if (!tenant_id) {
      return res.status(400).json({ message: 'tenant_id is required' })
    }

    const response = await fetch(`${API_GATEWAY_URL}/auth/switch-tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ tenant_id }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      console.error('Switch tenant failed:', response.status, errorData)
      return res.status(response.status).json({
        error: errorData.detail || errorData.error || 'Failed to switch tenant',
      })
    }

    const data = await response.json()

    if (!data.access_token || !data.refresh_token) {
      console.error('Invalid switch-tenant response:', data)
      return res.status(500).json({ error: 'Invalid response from auth service' })
    }

    // Update httpOnly cookies with new tokens
    const isProduction = process.env.NODE_ENV === 'production'
    const setCookieHeaders = [
      `access_token=${data.access_token}; Path=/; HttpOnly; SameSite=Lax${isProduction ? '; Secure' : ''}; Max-Age=${15 * 60}`,
      `refresh_token=${data.refresh_token}; Path=/; HttpOnly; SameSite=Lax${isProduction ? '; Secure' : ''}; Max-Age=${60 * 60 * 24 * 30}`,
    ]
    res.setHeader('Set-Cookie', setCookieHeaders)

    res.status(200).json({
      tenant_id: data.tenant_id,
      tenant_name: data.tenant_name,
      message: 'Tenant switched successfully',
    })
  } catch (error) {
    console.error('Switch tenant error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
