import type { NextApiRequest, NextApiResponse } from 'next'

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { code, state, error: oidcError, error_description } = req.query

  // Handle IdP-side errors
  if (oidcError) {
    console.error('OIDC error from IdP:', oidcError, error_description)
    return res.redirect(
      `/login?error=${encodeURIComponent(String(error_description || oidcError))}`
    )
  }

  if (!code || !state) {
    return res.redirect('/login?error=' + encodeURIComponent('認証情報が不足しています'))
  }

  try {
    const params = new URLSearchParams({
      code: String(code),
      state: String(state),
    })

    const response = await fetch(`${API_GATEWAY_URL}/auth/oidc/callback?${params}`)
    const data = await response.json()

    if (!response.ok) {
      const errorMsg = data.detail || data.error || 'OIDC認証に失敗しました'
      console.error('OIDC callback error:', errorMsg)
      return res.redirect(`/login?error=${encodeURIComponent(errorMsg)}`)
    }

    // Set httpOnly cookies (same pattern as login.ts)
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

    // Redirect to dashboard
    return res.redirect('/dashboard')
  } catch (error) {
    console.error('OIDC callback error:', error)
    return res.redirect('/login?error=' + encodeURIComponent('OIDC認証処理中にエラーが発生しました'))
  }
}
