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

  // Token refresh function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || router?.pathname === '/login') {
      return false
    }
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
        // Refresh SWR cache to prevent stale user data after token update
        mutate()
        return true
      }
      if (response.status === 401) {
        window.location.href = '/login'
      }
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

    const refreshInterval = setInterval(() => {
      refreshToken()
    }, TOKEN_REFRESH_INTERVAL_MS)

    // タブがバックグラウンドから復帰した時に即座にリフレッシュ
    // setIntervalはバックグラウンドタブでブラウザに抑制されるため、
    // 長時間離れて戻るとトークンが期限切れになっている
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
