import { useRouter } from 'next/router'
import useSWR from 'swr'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/hooks/use-auth'
import { fetcher } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface DocumentItem {
  id: string
  title: string
  status: string
  created_at: string
  updated_at: string
  page_count: number
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: '下書き', variant: 'secondary' },
  finalized: { label: '確定', variant: 'default' },
  exported: { label: 'エクスポート済', variant: 'outline' },
}

export default function ProposalDocumentListPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  const { data, mutate } = useSWR<{ items: DocumentItem[]; total: number }>(
    isAuthenticated ? '/api/sales/proposal-documents' : null,
    fetcher,
  )

  const handleDelete = async (id: string) => {
    if (!confirm('この提案書を削除しますか？')) return
    try {
      await fetch(`/api/sales/proposal-documents/${id}`, { method: 'DELETE' })
      mutate()
      toast({ title: '削除完了' })
    } catch {
      toast({ title: 'エラー', variant: 'destructive' })
    }
  }

  const items = data?.items || []

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">提案書一覧</h1>

        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>提案書がありません</p>
            <p className="text-sm mt-1">提案パイプラインを実行すると提案書が生成されます</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((doc) => {
              const status = STATUS_LABELS[doc.status] || STATUS_LABELS.draft
              return (
                <Card
                  key={doc.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/proposal-document/${doc.id}`)}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(doc.updated_at).toLocaleString('ja-JP')} ·{' '}
                          {doc.page_count}ページ
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(doc.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
