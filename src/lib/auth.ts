import { User } from '@/types'

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface TenantInfo {
  tenant_id: string
  name: string
  slug: string
  is_active: boolean
}

export interface UserTenant {
  id: string
  name: string
  slug: string
  is_default: boolean
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'ログインに失敗しました')
  }

  return response.json()
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('ログアウトに失敗しました')
  }
}

export async function refreshToken(): Promise<AuthTokens> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('トークンの更新に失敗しました')
  }

  return response.json()
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me')
    if (!response.ok) {
      return null
    }
    return response.json()
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return document.cookie.includes('access_token')
}

// --- Tenant utilities ---

export async function switchTenant(tenantId: string): Promise<{
  tenant_id: string
  tenant_name: string
}> {
  const response = await fetch('/api/auth/switch-tenant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tenant_id: tenantId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'テナント切替に失敗しました')
  }

  return response.json()
}

export async function resolveSlug(slug: string): Promise<TenantInfo | null> {
  try {
    const response = await fetch(
      `/api/auth/tenants/resolve-slug/${encodeURIComponent(slug)}`
    )
    if (!response.ok) {
      return null
    }
    return response.json()
  } catch {
    return null
  }
}

// --- Server-side utilities (for BFF API routes) ---

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export function getAccessTokenFromRequest(
  cookies: Partial<{ [key: string]: string }>
): string | undefined {
  return cookies.access_token
}

export function buildAuthHeader(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` }
}

export function buildCookieOptions(): string {
  return [
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ].filter(Boolean).join('; ')
}

export function getApiGatewayUrl(): string {
  return API_GATEWAY_URL
}
