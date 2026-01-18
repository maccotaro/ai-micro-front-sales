import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { User } from '@/types'
import { login as authLogin, logout as authLogout, getCurrentUser } from '@/lib/auth'

export function useAuth() {
  const router = useRouter()
  const { data: user, error, isLoading: swrLoading, mutate } = useSWR<User | null>(
    '/api/auth/me',
    getCurrentUser,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  // SWR's isLoading is true only during initial fetch
  const isLoading = swrLoading
  const isAuthenticated = !!user

  const login = useCallback(async (email: string, password: string) => {
    await authLogin(email, password)
    // Force immediate refetch and wait for the result
    const userData = await getCurrentUser()
    await mutate(userData, { revalidate: false })
    router.push('/dashboard')
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
  }
}

export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  return { user, isLoading }
}
