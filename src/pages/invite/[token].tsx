import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InvitationInfo {
  tenant_name: string
  tenant_slug: string
  email: string
  role: string
}

const ROLE_LABELS: Record<string, string> = {
  user: 'ユーザー',
  moderator: 'モデレーター',
  admin: '管理者',
  sales_user: '営業ユーザー',
  sales_manager: '営業マネージャー',
}

export default function InviteAcceptPage() {
  const router = useRouter()
  const { token } = router.query

  const [invitation, setInvitation] = useState<InvitationInfo | null>(null)
  const [verifying, setVerifying] = useState(true)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    if (!token || typeof token !== 'string') return

    const verify = async () => {
      setVerifying(true)
      try {
        const response = await fetch(`/api/auth/invitations/verify/${token}`)
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          setVerifyError(data.detail || '招待が無効か、有効期限が切れています')
          return
        }
        setInvitation(await response.json())
      } catch {
        setVerifyError('サーバーエラーが発生しました')
      } finally {
        setVerifying(false)
      }
    }

    verify()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password || password.length < 8) { setError('パスワードは8文字以上で入力してください'); return }
    if (password !== passwordConfirm) { setError('パスワードが一致しません'); return }
    if (!termsAgreed) { setError('利用規約に同意してください'); return }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invitation!.email,
          password,
          terms_agreed: true,
          invitation_token: token,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.detail || data.error || 'アカウント作成に失敗しました')
      }
      setRegistered(true)
    } catch (err: any) {
      setError(err.message || 'アカウント作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">招待を確認中...</p>
      </div>
    )
  }

  if (verifyError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-red-600">{verifyError}</p>
            <Link href="/login" className="text-blue-600 hover:underline text-sm">
              ログインページへ
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Head><title>登録完了</title></Head>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-xl font-bold">アカウントが作成されました</h2>
            <p className="text-gray-600">
              <strong>{invitation?.tenant_name}</strong> に参加しました。
              ログインして利用を開始してください。
            </p>
            <Link href="/login">
              <Button className="w-full mt-4">ログイン</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Head><title>{invitation?.tenant_name} への招待</title></Head>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {invitation?.tenant_name} への招待
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            ロール: <strong>{ROLE_LABELS[invitation?.role || ''] || invitation?.role}</strong>
          </p>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>メールアドレス</Label>
              <Input type="email" value={invitation?.email || ''} disabled className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">パスワード（確認）</Label>
              <Input
                id="passwordConfirm"
                type="password"
                autoComplete="new-password"
                required
                placeholder="パスワードを再入力"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <input
                id="terms"
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm leading-5">
                <Link href="/terms" className="text-blue-600 hover:underline" target="_blank">利用規約</Link>
                {' '}および{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline" target="_blank">プライバシーポリシー</Link>
                {' '}に同意します
              </Label>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '作成中...' : 'アカウントを作成して参加'}
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                既にアカウントをお持ちですか？{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">ログイン</Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
