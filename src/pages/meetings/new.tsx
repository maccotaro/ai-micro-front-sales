import { useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MainLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { meetingMinutesApi } from '@/lib/api'

const formSchema = z.object({
  company_name: z.string().min(1, '会社名を入力してください'),
  raw_text: z.string().min(1, '議事録内容を入力してください'),
  industry: z.string().optional(),
  area: z.string().optional(),
  meeting_date: z.string().optional(),
  attendees_text: z.string().optional(),
  next_action_date: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function NewMeetingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meeting_date: new Date().toISOString().split('T')[0],
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Parse attendees from comma-separated text to array of objects
      const attendees = data.attendees_text
        ? data.attendees_text.split(',').map((s) => ({ name: s.trim() })).filter((a) => a.name)
        : undefined

      const result = await meetingMinutesApi.create({
        company_name: data.company_name,
        raw_text: data.raw_text,
        industry: data.industry || undefined,
        area: data.area || undefined,
        meeting_date: data.meeting_date || undefined,
        attendees,
        next_action_date: data.next_action_date || undefined,
      })

      toast({
        title: '作成完了',
        description: '議事録を作成しました',
      })

      router.push(`/meetings/${result.id}`)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '作成に失敗しました',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout title="新規議事録作成 - Sales AI">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/meetings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">新規議事録作成</h1>
            <p className="mt-1 text-sm text-gray-500">
              商談の議事録を作成します
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>議事録情報</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name">会社名 *</Label>
                  <Input
                    id="company_name"
                    placeholder="例: 株式会社サンプル"
                    {...register('company_name')}
                  />
                  {errors.company_name && (
                    <p className="text-sm text-red-500">{errors.company_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_date">商談日</Label>
                  <Input
                    id="meeting_date"
                    type="date"
                    {...register('meeting_date')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">業種</Label>
                  <Input
                    id="industry"
                    placeholder="例: IT, 製造業, 小売業"
                    {...register('industry')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">地域</Label>
                  <Input
                    id="area"
                    placeholder="例: 東京, 大阪, 名古屋"
                    {...register('area')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendees_text">参加者（カンマ区切り）</Label>
                  <Input
                    id="attendees_text"
                    placeholder="例: 山田太郎, 佐藤花子"
                    {...register('attendees_text')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="next_action_date">次回アクション日</Label>
                  <Input
                    id="next_action_date"
                    type="date"
                    {...register('next_action_date')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="raw_text">議事録内容 *</Label>
                <Textarea
                  id="raw_text"
                  placeholder="商談の内容を入力してください..."
                  rows={12}
                  {...register('raw_text')}
                />
                {errors.raw_text && (
                  <p className="text-sm text-red-500">{errors.raw_text.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/meetings">
                  <Button variant="outline" type="button">
                    キャンセル
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? '保存中...' : '保存'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
