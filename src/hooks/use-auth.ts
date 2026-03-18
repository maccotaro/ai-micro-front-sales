import { useCallback } from 'react'
import { useRouter } from 'next/router'
import {
  useAuth as useAuthBase,
  useRequireAuth,
} from '@maccotaro/ai-micro-lib-frontend/auth'
export type { AuthUser } from '@maccotaro/ai-micro-lib-frontend/auth'

export { useRequireAuth }

/**
 * Sales-specific useAuth wrapper.
 * Overrides login to redirect to /meetings after success.
 */
export function useAuth() {
  const auth = useAuthBase()
  const router = useRouter()

  const login = useCallback(async (email: string, password: string) => {
    const userData = await auth.login(email, password)
    router.push('/meetings')
    return userData
  }, [auth, router])

  return { ...auth, login }
}
