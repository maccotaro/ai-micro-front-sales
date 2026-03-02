import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { MainLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { fetcher } from '@/lib/api'
import { MeetingMinute, PaginatedResponse } from '@/types'

const PAGE_SIZE = 20

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' }> = {
  draft: { label: '下書き', variant: 'secondary' },
  analyzed: { label: '解析済み', variant: 'default' },
  proposed: { label: '提案済み', variant: 'success' },
  closed: { label: '完了', variant: 'warning' },
}

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const { data, error, isLoading } = useSWR<PaginatedResponse<MeetingMinute>>(
    `/api/sales/meeting-minutes?page=${page}&page_size=${PAGE_SIZE}`,
    fetcher
  )
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0

  const meetings = data?.items ?? []
  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meeting.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (meeting.area?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  return (
    <MainLayout title="議事録一覧 - Sales AI">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">議事録一覧</h1>
          <Link href="/meetings/new">
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              新規作成
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="会社名、業種、地域で検索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="pl-10 h-9 text-sm"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-red-500">データの取得に失敗しました</p>
            </CardContent>
          </Card>
        ) : filteredMeetings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-3 text-base font-medium text-gray-900">
                議事録がありません
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                新規作成ボタンから議事録を作成してください
              </p>
              <Link href="/meetings/new">
                <Button size="sm" className="mt-3">
                  <Plus className="mr-1.5 h-4 w-4" />
                  新規作成
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">会社名</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-24">業種</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-20">地域</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-28">商談日</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-600 w-24">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeetings.map((meeting) => (
                    <Link key={meeting.id} href={`/meetings/${meeting.id}`} legacyBehavior>
                      <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors">
                        <td className="px-4 py-2.5 font-medium text-gray-900">
                          {meeting.company_name}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">
                          {meeting.industry || '-'}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">
                          {meeting.area || '-'}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">
                          {meeting.meeting_date ? formatDate(meeting.meeting_date) : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <Badge variant={statusLabels[meeting.status]?.variant}>
                            {statusLabels[meeting.status]?.label || meeting.status}
                          </Badge>
                        </td>
                      </tr>
                    </Link>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  全 {data?.total ?? 0} 件中 {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, data?.total ?? 0)} 件
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    前へ
                  </Button>
                  <span className="text-xs text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    次へ
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}
