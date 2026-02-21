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
      return res.status(401).json({ message: 'Not authenticated' })
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
      return res.status(response.status).json({
        message: errorData.detail || errorData.message || 'Failed to switch tenant',
      })
    }

    const data = await response.json()

    if (!data.access_token || !data.refresh_token) {
      return res.status(500).json({ message: 'Invalid response from auth service' })
    }

    // Update httpOnly cookies with new tokens
    const cookieOptions = [
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ].filter(Boolean).join('; ')

    res.setHeader('Set-Cookie', [
      `access_token=${data.access_token}; ${cookieOptions}; Max-Age=900`,
      `refresh_token=${data.refresh_token}; ${cookieOptions}; Max-Age=604800`,
    ])

    return res.status(200).json({
      tenant_id: data.tenant_id,
      tenant_name: data.tenant_name,
      message: 'Tenant switched successfully',
    })
  } catch (error) {
    console.error('Switch tenant error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
