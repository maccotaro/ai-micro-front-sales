import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function VerifyEmailPendingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const email = typeof router.query.email === 'string' ? router.query.email : ''

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: '送信完了',
          description: '確認メールを再送信しました。メールボックスをご確認ください。',
        })
        setResendCooldown(60)
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast({
          variant: 'destructive',
          title: '送信エラー',
          description: result.error || result.detail || result.message || '再送信に失敗しました',
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: '再送信中にエラーが発生しました',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <>
      <Head>
        <title>メール認証待ち - Sales AI</title>
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">メールをご確認ください</CardTitle>
            <CardDescription>
              {email ? (
                <>
                  <span className="font-medium text-gray-900">{email}</span> に確認メールを送信しました。
                </>
              ) : (
                '確認メールを送信しました。'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                メール内のリンクをクリックしてアカウントを有効化してください。
                メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0 || !email}
            >
              {isResending
                ? '送信中...'
                : resendCooldown > 0
                  ? `再送信可能まで ${resendCooldown}秒`
                  : '確認メールを再送信'}
            </Button>

            <div className="text-center">
              <a href="/login" className="text-sm font-medium text-blue-600 hover:underline">
                ログインページに戻る
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
