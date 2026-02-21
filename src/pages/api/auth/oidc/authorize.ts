import type { NextApiRequest, NextApiResponse } from 'next'

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { provider_id, redirect_uri, signup_tenant_id } = req.query

  if (!provider_id || !redirect_uri) {
    return res.status(400).json({ message: 'provider_id と redirect_uri は必須です' })
  }

  try {
    const params = new URLSearchParams({
      provider_id: String(provider_id),
      redirect_uri: String(redirect_uri),
    })
    if (signup_tenant_id) {
      params.set('signup_tenant_id', String(signup_tenant_id))
    }

    const response = await fetch(`${API_GATEWAY_URL}/auth/oidc/authorize?${params}`)
    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.redirect(302, data.redirect_url)
  } catch (error) {
    console.error('OIDC authorize error:', error)
    return res.status(500).json({ message: 'OIDC認証の開始に失敗しました' })
  }
}
