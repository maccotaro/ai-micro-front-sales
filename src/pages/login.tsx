import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

const loginSchema = z.object({
  email: z.string().email('\u6709\u52B9\u306A\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044'),
  password: z.string().min(1, '\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface OIDCProvider { id: string; name: string; provider_type: string }

function MicrosoftIcon() {
  return (
    <svg className="h-5 w-5 mr-2" viewBox="0 0 21 21" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function ProviderIcon({ providerType }: { providerType: string }) {
  if (providerType === 'microsoft' || providerType === 'azure_ad') return <MicrosoftIcon />
  if (providerType === 'google') return <GoogleIcon />
  return (
    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  )
}

function getProviderLabel(provider: OIDCProvider): string {
  const labels: Record<string, string> = {
    microsoft: 'Microsoft\u3067\u30ED\u30B0\u30A4\u30F3',
    azure_ad: 'Microsoft\u3067\u30ED\u30B0\u30A4\u30F3',
    google: 'Google\u3067\u30ED\u30B0\u30A4\u30F3',
  }
  return labels[provider.provider_type] || `${provider.name}\u3067\u30ED\u30B0\u30A4\u30F3`
}

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [providers, setProviders] = useState<OIDCProvider[]>([])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaToken, setMfaToken] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)
  const [recoveryCode, setRecoveryCode] = useState('')
  const [mfaError, setMfaError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (router.query.error) {
      setError(String(router.query.error))
    }
    if (router.query.verified === 'true') {
      setSuccessMessage('メールアドレスの確認が完了しました。ログインしてください。')
    }
    if (router.query.mfa_required === 'true' && router.query.mfa_token) {
      setMfaRequired(true)
      setMfaToken(String(router.query.mfa_token))
    }
  }, [router.query.error, router.query.verified, router.query.mfa_required, router.query.mfa_token])

  useEffect(() => { fetchProviders() }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/auth/providers')
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers || [])
      }
    } catch {}
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')
    setSuccessMessage('')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })
      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.message || resData.detail || '\u30ED\u30B0\u30A4\u30F3\u306B\u5931\u6557\u3057\u307E\u3057\u305F')
      }

      if (resData.mfa_required) {
        setMfaRequired(true)
        setMfaToken(resData.mfa_token)
        setIsLoading(false)
        return
      }

      // Normal login success - cookies already set by BFF, redirect
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally { setIsLoading(false) }
  }

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setMfaError(''); setIsLoading(true)
    try {
      const endpoint = useRecoveryCode ? '/api/auth/mfa/verify-recovery' : '/api/auth/mfa/verify'
      const body = useRecoveryCode
        ? { mfa_token: mfaToken, recovery_code: recoveryCode }
        : { mfa_token: mfaToken, code: mfaCode }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok) {
        setMfaError(data.detail || '\u8A8D\u8A3C\u306B\u5931\u6557\u3057\u307E\u3057\u305F')
        return
      }
      window.location.href = '/meetings'
    } catch {
      setMfaError('\u8A8D\u8A3C\u306B\u5931\u6557\u3057\u307E\u3057\u305F')
    } finally { setIsLoading(false) }
  }

  const handleOIDCLogin = (providerId: string) => {
    const callbackUrl = `${window.location.origin}/api/auth/oidc/callback`
    window.location.href = `/api/auth/oidc/authorize?provider_id=${providerId}&redirect_uri=${encodeURIComponent(callbackUrl)}`
  }

  if (mfaRequired) {
    return (
      <>
        <Head><title>{'\u4E8C\u8981\u7D20\u8A8D\u8A3C - Sales AI'}</title></Head>
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {useRecoveryCode ? '\u30EA\u30AB\u30D0\u30EA\u30FC\u30B3\u30FC\u30C9' : '\u4E8C\u8981\u7D20\u8A8D\u8A3C'}
              </CardTitle>
              <CardDescription>
                {useRecoveryCode ? '\u30EA\u30AB\u30D0\u30EA\u30FC\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044' : '\u8A8D\u8A3C\u30A2\u30D7\u30EA\u306E6\u6841\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mfaError && <p className="text-sm text-red-500 mb-4">{mfaError}</p>}
              <form onSubmit={handleMfaVerify} className="space-y-4">
                {useRecoveryCode ? (
                  <div className="space-y-2">
                    <Label htmlFor="recovery-code">{'\u30EA\u30AB\u30D0\u30EA\u30FC\u30B3\u30FC\u30C9'}</Label>
                    <Input id="recovery-code" type="text" placeholder="xxxx-xxxx" value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} autoFocus autoComplete="off" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="mfa-code">{'\u8A8D\u8A3C\u30B3\u30FC\u30C9'}</Label>
                    <Input id="mfa-code" type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))} autoFocus autoComplete="one-time-code" className="text-center text-2xl tracking-[0.5em] font-mono" />
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '\u691C\u8A3C\u4E2D...' : '\u691C\u8A3C'}
                </Button>
              </form>
              <div className="mt-4 text-center space-y-2">
                <button type="button" onClick={() => { setUseRecoveryCode(!useRecoveryCode); setMfaError('') }} className="text-sm text-blue-600 hover:underline">
                  {useRecoveryCode ? '\u8A8D\u8A3C\u30A2\u30D7\u30EA\u3092\u4F7F\u7528' : '\u30EA\u30AB\u30D0\u30EA\u30FC\u30B3\u30FC\u30C9\u3092\u4F7F\u7528'}
                </button>
                <br />
                <button type="button" onClick={() => { setMfaRequired(false); setMfaToken(''); setMfaCode(''); setRecoveryCode(''); setUseRecoveryCode(false); setMfaError('') }} className="text-sm text-gray-500 hover:underline">
                  {'\u30ED\u30B0\u30A4\u30F3\u306B\u623B\u308B'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>{'\u30ED\u30B0\u30A4\u30F3 - Sales AI'}</title></Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Sales AI</CardTitle>
            <CardDescription>{'\u55B6\u696D\u652F\u63F4AI\u30B5\u30FC\u30D3\u30B9'}</CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <div className="rounded-md bg-green-50 border border-green-200 p-4 mb-4">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {providers.length > 0 && (
              <div className="space-y-3 mb-6">
                {providers.map((provider) => (
                  <Button key={provider.id} type="button" variant="outline" className="w-full" onClick={() => handleOIDCLogin(provider.id)} disabled={isLoading}>
                    <ProviderIcon providerType={provider.provider_type} />
                    {getProviderLabel(provider)}
                  </Button>
                ))}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                  <div className="relative flex justify-center text-xs"><span className="px-4 bg-white text-gray-500">{'\u307E\u305F\u306F'}</span></div>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{'\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9'}</Label>
                <Input id="email" type="email" placeholder="example@company.com" {...register('email')} disabled={isLoading} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{'\u30D1\u30B9\u30EF\u30FC\u30C9'}</Label>
                <Input id="password" type="password" {...register('password')} disabled={isLoading} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '\u30ED\u30B0\u30A4\u30F3\u4E2D...' : '\u30ED\u30B0\u30A4\u30F3'}
              </Button>
            </form>
            <div className="mt-4 text-center space-y-2">
              <p className="text-sm">
                <a href="/forgot-password" className="font-medium text-blue-600 hover:underline">
                  {'\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5FD8\u308C\u305F\u65B9\u306F\u3053\u3061\u3089'}
                </a>
              </p>
              <p className="text-sm text-gray-600">
                {'\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u304A\u6301\u3061\u3067\u306A\u3044\u65B9\u306F'}{' '}
                <a href="/signup" className="font-medium text-blue-600 hover:underline">
                  {'\u65B0\u898F\u767B\u9332'}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
