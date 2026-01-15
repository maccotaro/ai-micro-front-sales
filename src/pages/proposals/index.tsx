import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { MainLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Lightbulb, Calendar, Package } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { fetcher } from '@/lib/api'
import { Proposal } from '@/types'

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export default function ProposalsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, error, isLoading } = useSWR<PaginatedResponse<Proposal>>(
    '/api/sales/proposals',
    fetcher
  )

  const proposals = data?.items ?? []

  return (
    <MainLayout title="提案書一覧 - Sales AI">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">提案書一覧</h1>
          <p className="mt-1 text-sm text-gray-500">
            AIが生成した提案書を管理します
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="提案書を検索..."
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
        ) : proposals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Lightbulb className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                提案書がありません
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                議事録を解析して提案書を生成してください
              </p>
              <Link href="/meetings">
                <Button className="mt-4">議事録一覧へ</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {proposals.map((proposal) => (
              <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {proposal.proposal_json?.title || `提案書 #${proposal.id.slice(0, 8)}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {proposal.proposal_json?.summary || '提案書の概要'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Package className="mr-1 h-4 w-4" />
                        商品: {proposal.proposal_json?.recommended_products?.length || 0}件
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {formatDateTime(proposal.created_at)}
                      </div>
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
