import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { token } = router.query

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }

    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      return
    }

    if (!token) {
      setError('無効なリセットリンクです')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'パスワードリセットに失敗しました')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>新しいパスワードの設定 - Sales AI</title>
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">新しいパスワードの設定</CardTitle>
            <CardDescription>新しいパスワードを入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="rounded-md bg-green-50 border border-green-200 p-4">
                  <p className="text-sm text-green-700">
                    パスワードが正常にリセットされました。ログインページに移動します...
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="outline" className="w-full mt-4">
                    ログインページへ
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {!token && router.isReady ? (
                  <div className="text-center space-y-4">
                    <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
                      <p className="text-sm text-yellow-700">
                        無効なリセットリンクです。パスワードリセットをやり直してください。
                      </p>
                    </div>
                    <Link href="/forgot-password">
                      <Button variant="outline" className="w-full mt-4">
                        パスワードリセットへ
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">新しいパスワード</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        placeholder="8文字以上"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passwordConfirm">パスワード確認</Label>
                      <Input
                        id="passwordConfirm"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        placeholder="パスワードを再入力"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'リセット中...' : 'パスワードをリセット'}
                    </Button>

                    <div className="text-center">
                      <Link href="/login" className="text-sm font-medium text-blue-600 hover:underline">
                        ログインに戻る
                      </Link>
                    </div>
                  </form>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
