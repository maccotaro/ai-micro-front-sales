import { useState, useCallback } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

const signupSchema = z
  .object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
    confirmPassword: z.string().min(1, 'パスワード確認を入力してください'),
    organizationName: z.string().min(1, '組織名を入力してください'),
    termsAgreed: z.literal(true, {
      errorMap: () => ({ message: '利用規約に同意してください' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

async function getCaptchaToken(): Promise<string> {
  if (!RECAPTCHA_SITE_KEY) return ''
  try {
    const grecaptcha = (window as unknown as { grecaptcha: { execute: (key: string, opts: { action: string }) => Promise<string> } }).grecaptcha
    if (!grecaptcha) return ''
    return await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'signup' })
  } catch {
    return ''
  }
}

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      termsAgreed: undefined,
    },
  })

  const onSubmit = useCallback(async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const captchaToken = await getCaptchaToken()

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          create_tenant: true,
          organization_name: data.organizationName,
          terms_agreed: true,
          captcha_token: captchaToken,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        router.push(`/verify-email-pending?email=${encodeURIComponent(data.email)}`)
      } else {
        toast({
          variant: 'destructive',
          title: '登録エラー',
          description: result.error || result.detail || result.message || '登録に失敗しました',
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: '登録中にエラーが発生しました',
      })
    } finally {
      setIsLoading(false)
    }
  }, [router, toast])

  return (
    <>
      <Head>
        <title>新規登録 - Sales AI</title>
      </Head>
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}

      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Sales AI</CardTitle>
            <CardDescription>アカウントを作成</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">組織名</Label>
                <Input
                  id="organizationName"
                  type="text"
                  placeholder="株式会社サンプル"
                  {...register('organizationName')}
                  disabled={isLoading}
                />
                {errors.organizationName && (
                  <p className="text-sm text-red-500">{errors.organizationName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@company.com"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード確認</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <input
                  id="termsAgreed"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  {...register('termsAgreed')}
                  disabled={isLoading}
                />
                <Label htmlFor="termsAgreed" className="text-sm leading-5">
                  <a href="/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    利用規約
                  </a>
                  {' '}および{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    プライバシーポリシー
                  </a>
                  {' '}に同意します
                </Label>
              </div>
              {errors.termsAgreed && (
                <p className="text-sm text-red-500">{errors.termsAgreed.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '登録中...' : '新規登録'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">
                アカウントをお持ちの方は{' '}
                <a href="/login" className="font-medium text-blue-600 hover:underline">
                  ログイン
                </a>
              </span>
            </div>

            {RECAPTCHA_SITE_KEY && (
              <p className="mt-4 text-xs text-gray-400 text-center">
                このサイトはreCAPTCHAで保護されています。
                Googleの
                <a href="https://policies.google.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a>
                と
                <a href="https://policies.google.com/terms" className="underline" target="_blank" rel="noopener noreferrer">利用規約</a>
                が適用されます。
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
