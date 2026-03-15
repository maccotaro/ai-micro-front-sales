import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { User } from '@/types'
import { login as authLogin, logout as authLogout, getCurrentUser } from '@/lib/auth'

const TOKEN_REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes (5 min buffer before 15 min expiry)

export function useAuth() {
  const router = useRouter()
  const isRefreshingRef = useRef(false)
  const { data: user, error, isLoading: swrLoading, mutate } = useSWR<User | null>(
    '/api/auth/me',
    getCurrentUser,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  const isLoading = swrLoading
  const isAuthenticated = !!user

  // Token refresh function — single gate via isRefreshingRef
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || router?.pathname === '/login') {
      return false
    }
    // Prevent concurrent refresh requests (critical: backend rotates refresh tokens)
    if (isRefreshingRef.current) {
      return false
    }
    isRefreshingRef.current = true
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      isRefreshingRef.current = false
      if (response.ok) {
        // Refresh SWR cache to reflect new auth state
        mutate()
        return true
      }
      // Don't redirect immediately on 401 — a concurrent refresh may have
      // already succeeded and set valid cookies. Let useRequireAuth handle
      // the redirect after confirming auth is truly lost.
      return false
    } catch {
      isRefreshingRef.current = false
      return false
    }
  }, [router?.pathname, mutate])

  // Auto-refresh token every 10 minutes + on tab focus return
  useEffect(() => {
    if (typeof window === 'undefined' || !router?.isReady) return
    if (router?.pathname === '/login') return

    // Single refresh interval only — do NOT add a second interval.
    // The backend rotates refresh tokens (single-use), so two concurrent
    // refreshes cause the second to 401 → logout.
    const refreshInterval = setInterval(() => {
      refreshToken()
    }, TOKEN_REFRESH_INTERVAL_MS)

    // Tab visibility change: refresh immediately when returning from background.
    // Browsers throttle setInterval in background tabs, so the token may have
    // expired while the tab was hidden.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshToken()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router?.isReady, router?.pathname, refreshToken])

  const login = useCallback(async (email: string, password: string) => {
    await authLogin(email, password)
    const userData = await getCurrentUser()
    await mutate(userData, { revalidate: false })
    router.push('/meetings')
  }, [mutate, router])

  const logout = useCallback(async () => {
    await authLogout()
    await mutate(null)
    router.push('/login')
  }, [mutate, router])

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    mutate,
    refreshToken,
  }
}

export function useRequireAuth() {
  const auth = useAuth()
  const { user, isLoading, isAuthenticated } = auth
  const router = useRouter()
  const redirectingRef = useRef(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !redirectingRef.current) {
      // Try refresh before redirecting
      auth.refreshToken().then((success) => {
        if (!success && !redirectingRef.current) {
          redirectingRef.current = true
          router.push('/login')
        }
      })
    }
  }, [isLoading, isAuthenticated, router, auth])

  return { user, isLoading }
}
