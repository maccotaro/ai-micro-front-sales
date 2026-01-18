import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { MainLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, FileText, Calendar, Building2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { fetcher } from '@/lib/api'
import { MeetingMinute } from '@/types'

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' }> = {
  draft: { label: '下書き', variant: 'secondary' },
  analyzed: { label: '解析済み', variant: 'default' },
  proposed: { label: '提案済み', variant: 'success' },
  closed: { label: '完了', variant: 'warning' },
}

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, error, isLoading } = useSWR<PaginatedResponse<MeetingMinute>>(
    '/api/sales/meeting-minutes',
    fetcher
  )

  const meetings = data?.items ?? []
  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meeting.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (meeting.area?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  return (
    <MainLayout title="議事録一覧 - Sales AI">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">議事録一覧</h1>
            <p className="mt-1 text-sm text-gray-500">
              商談議事録を管理し、AIで解析します
            </p>
          </div>
          <Link href="/meetings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="会社名、業種、地域で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-500">データの取得に失敗しました</p>
            </CardContent>
          </Card>
        ) : filteredMeetings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                議事録がありません
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                新規作成ボタンから議事録を作成してください
              </p>
              <Link href="/meetings/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  新規作成
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredMeetings.map((meeting) => (
              <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{meeting.company_name}</CardTitle>
                      <Badge variant={statusLabels[meeting.status]?.variant}>
                        {statusLabels[meeting.status]?.label || meeting.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {meeting.meeting_date ? formatDate(meeting.meeting_date) : '-'}
                      </div>
                      {meeting.industry && (
                        <div className="flex items-center">
                          <Building2 className="mr-1 h-4 w-4" />
                          {meeting.industry}
                        </div>
                      )}
                      {meeting.area && (
                        <span className="text-gray-400">{meeting.area}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
