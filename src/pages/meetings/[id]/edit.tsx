import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWR from 'swr'
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
import { MeetingMinute } from '@/types'

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

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default function EditMeetingPage() {
  const router = useRouter()
  const { id } = router.query
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: meeting, error } = useSWR<MeetingMinute>(
    id ? `/api/sales/meeting-minutes/${id}` : null,
    fetcher
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  // Reset form when meeting data is loaded
  useEffect(() => {
    if (meeting) {
      const attendeesText = meeting.attendees
        ?.map((a) => a.name)
        .join(', ') || ''

      reset({
        company_name: meeting.company_name,
        raw_text: meeting.raw_text || '',
        industry: meeting.industry || '',
        area: meeting.area || '',
        meeting_date: meeting.meeting_date || '',
        attendees_text: attendeesText,
        next_action_date: meeting.next_action_date || '',
      })
    }
  }, [meeting, reset])

  const onSubmit = async (data: FormData) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      // Parse attendees from comma-separated text to array of objects
      const attendees = data.attendees_text
        ? data.attendees_text.split(',').map((s) => ({ name: s.trim() })).filter((a) => a.name)
        : undefined

      await meetingMinutesApi.update(id as string, {
        company_name: data.company_name,
        raw_text: data.raw_text,
        industry: data.industry || undefined,
        area: data.area || undefined,
        meeting_date: data.meeting_date || undefined,
        attendees,
        next_action_date: data.next_action_date || undefined,
      })

      toast({
        title: '更新完了',
        description: '議事録を更新しました',
      })

      router.push(`/meetings/${id}`)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '更新に失敗しました',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <MainLayout title="エラー - Sales AI">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">データの取得に失敗しました</p>
            <Link href="/meetings">
              <Button className="mt-4">議事録一覧に戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </MainLayout>
    )
  }

  if (!meeting) {
    return (
      <MainLayout title="読み込み中... - Sales AI">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title={`${meeting.company_name}の編集 - Sales AI`}>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href={`/meetings/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">議事録の編集</h1>
            <p className="mt-1 text-sm text-gray-500">
              {meeting.company_name}の議事録を編集します
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
                <Link href={`/meetings/${id}`}>
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
