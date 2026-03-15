import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/hooks/use-auth'
import { fetcher } from '@/lib/api'
import { PageList } from '@/components/proposal-document/PageList'
import { SlidePreview } from '@/components/proposal-document/SlidePreview'
import { DocumentChat } from '@/components/proposal-document/DocumentChat'
import { ExportMenu } from '@/components/proposal-document/ExportMenu'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface ProposalPage {
  id: string
  page_number: number
  title: string | null
  markdown_content: string
  purpose: string | null
}

interface ProposalDocument {
  id: string
  title: string
  status: string
  marp_theme: string
  story_structure: Record<string, unknown>
  pipeline_run_id: string | null
  minute_id: string | null
  created_at: string
  updated_at: string
  pages: ProposalPage[]
}

export default function ProposalDocumentPage() {
  const router = useRouter()
  const { id } = router.query
  const { isAuthenticated } = useAuth()
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [chatTab, setChatTab] = useState<'global' | 'page'>('page')

  const { data: doc, error, mutate } = useSWR<ProposalDocument>(
    isAuthenticated && id ? `/api/sales/proposal-documents/${id}` : null,
    fetcher,
  )

  // Select first page by default
  useEffect(() => {
    if (doc?.pages?.length && !selectedPageId) {
      setSelectedPageId(doc.pages[0].id)
    }
  }, [doc, selectedPageId])

  const selectedPage = doc?.pages?.find((p) => p.id === selectedPageId) || null

  if (error) {
    return (
      <MainLayout>
        <div className="p-6 text-red-500">
          提案書の読み込みに失敗しました。
        </div>
      </MainLayout>
    )
  }

  if (!doc) {
    return (
      <MainLayout>
        <div className="p-6 text-gray-500">読み込み中...</div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/proposal-pipeline')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            戻る
          </Button>
          <h1 className="text-lg font-semibold">{doc.title}</h1>
        </div>
        <ExportMenu documentId={doc.id} />
      </div>

      {/* Main content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left: Page list */}
        <div className="w-56 border-r overflow-y-auto">
          <PageList
            pages={doc.pages}
            selectedPageId={selectedPageId}
            onSelectPage={setSelectedPageId}
          />
        </div>

        {/* Right: Preview + Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Slide preview */}
          <div className="flex-1 overflow-y-auto p-6">
            <SlidePreview page={selectedPage} />
          </div>

          {/* Chat panel */}
          <div className="h-80 border-t">
            <DocumentChat
              documentId={doc.id}
              pageId={selectedPageId}
              chatTab={chatTab}
              onTabChange={setChatTab}
              onContentUpdated={() => mutate()}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
