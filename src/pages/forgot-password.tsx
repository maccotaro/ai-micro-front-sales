import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'リクエストに失敗しました')
      }

      setSent(true)
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>パスワードリセット - Sales AI</title>
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">パスワードリセット</CardTitle>
            <CardDescription>登録済みのメールアドレスを入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="rounded-md bg-green-50 border border-green-200 p-4">
                  <p className="text-sm text-green-700">
                    パスワードリセット用のメールを送信しました。メールをご確認ください。
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  メールが届かない場合は、迷惑メールフォルダをご確認ください。
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full mt-4">
                    ログインに戻る
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@company.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '送信中...' : 'リセットメールを送信'}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <Link href="/login" className="text-sm font-medium text-blue-600 hover:underline">
                    ログインに戻る
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
