import { User } from '@/types'

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
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
