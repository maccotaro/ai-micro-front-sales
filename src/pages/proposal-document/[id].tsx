import { useRouter } from 'next/router'
import { useEffect, useState, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/hooks/use-auth'
import { fetcher } from '@/lib/api'
import { PageList } from '@/components/proposal-document/PageList'
import { SlidePreview } from '@/components/proposal-document/SlidePreview'
import { DocumentChat } from '@/components/proposal-document/DocumentChat'
import { ExportMenu } from '@/components/proposal-document/ExportMenu'
import { InterviewDialog } from '@/components/proposal-document/InterviewDialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Pencil, Eye, Save, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

interface SaveResult {
  changed_pages: number[]
  is_significant: boolean
  persona_id: string | null
}

export default function ProposalDocumentPage() {
  const router = useRouter()
  const { id } = router.query
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [chatTab, setChatTab] = useState<'global' | 'page'>('page')

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState<Record<number, string>>({})
  const [originalContent, setOriginalContent] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)
  const [changedPages, setChangedPages] = useState<number[]>([])

  // Interview dialog
  const [interviewOpen, setInterviewOpen] = useState(false)
  const [interviewPersonaId, setInterviewPersonaId] = useState('')
  const [interviewChangedCount, setInterviewChangedCount] = useState(0)

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

  // Initialize edit content when entering edit mode or when doc loads
  useEffect(() => {
    if (doc?.pages) {
      const content: Record<number, string> = {}
      for (const p of doc.pages) {
        content[p.page_number] = p.markdown_content
      }
      setOriginalContent(content)
      if (Object.keys(editedContent).length === 0) {
        setEditedContent(content)
      }
    }
  }, [doc]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPage = doc?.pages?.find((p) => p.id === selectedPageId) || null

  const currentPageContent = useMemo(() => {
    if (!selectedPage) return ''
    if (isEditing) {
      return editedContent[selectedPage.page_number] ?? selectedPage.markdown_content
    }
    return selectedPage.markdown_content
  }, [selectedPage, isEditing, editedContent])

  const handleToggleEdit = useCallback(() => {
    if (isEditing) {
      // Exiting edit mode without saving — reset
      if (doc?.pages) {
        const content: Record<number, string> = {}
        for (const p of doc.pages) {
          content[p.page_number] = p.markdown_content
        }
        setEditedContent(content)
      }
      setChangedPages([])
    } else {
      // Entering edit mode — copy current content
      if (doc?.pages) {
        const content: Record<number, string> = {}
        for (const p of doc.pages) {
          content[p.page_number] = p.markdown_content
        }
        setEditedContent(content)
        setOriginalContent(content)
      }
    }
    setIsEditing(!isEditing)
  }, [isEditing, doc])

  const handlePageContentChange = useCallback((pageNumber: number, content: string) => {
    setEditedContent((prev) => ({ ...prev, [pageNumber]: content }))
  }, [])

  const handleSave = useCallback(async () => {
    if (!doc || saving) return
    setSaving(true)

    const pages = doc.pages.map((p) => ({
      page_number: p.page_number,
      markdown_content: editedContent[p.page_number] ?? p.markdown_content,
    }))

    try {
      const res = await fetch(`/api/sales/proposal-documents/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pages }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const result: SaveResult = await res.json()
      setChangedPages(result.changed_pages)

      if (result.changed_pages.length > 0) {
        toast({
          title: '保存完了',
          description: `${result.changed_pages.length}箇所の変更を検出しました`,
        })
      } else {
        toast({ title: '保存完了', description: '変更はありませんでした' })
      }

      // Refresh data
      await mutate()
      setIsEditing(false)

      // Show interview dialog if significant diff + persona
      if (result.is_significant && result.persona_id) {
        setInterviewPersonaId(result.persona_id)
        setInterviewChangedCount(result.changed_pages.length)
        setInterviewOpen(true)
      }
    } catch {
      toast({ variant: 'destructive', title: 'エラー', description: '保存に失敗しました' })
    } finally {
      setSaving(false)
    }
  }, [doc, editedContent, saving, toast, mutate])

  if (error) {
    return (
      <MainLayout>
        <div className="p-6 text-red-500">提案書の読み込みに失敗しました。</div>
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
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleToggleEdit} disabled={saving}>
                <Eye className="h-4 w-4 mr-1" />
                キャンセル
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                保存
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleToggleEdit}>
                <Pencil className="h-4 w-4 mr-1" />
                編集
              </Button>
              <ExportMenu documentId={doc.id} />
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left: Page list */}
        <div className="w-56 border-r overflow-y-auto">
          <PageList
            pages={doc.pages}
            selectedPageId={selectedPageId}
            onSelectPage={setSelectedPageId}
            changedPages={changedPages}
          />
        </div>

        {/* Right: Preview/Editor + Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {isEditing && selectedPage ? (
              <EditableSlide
                page={selectedPage}
                content={editedContent[selectedPage.page_number] ?? selectedPage.markdown_content}
                onChange={(content) => handlePageContentChange(selectedPage.page_number, content)}
              />
            ) : (
              <SlidePreview page={selectedPage} />
            )}
          </div>

          {/* Chat panel (hidden in edit mode) */}
          {!isEditing && (
            <div className="h-80 border-t">
              <DocumentChat
                documentId={doc.id}
                pageId={selectedPageId}
                chatTab={chatTab}
                onTabChange={setChatTab}
                onContentUpdated={() => mutate()}
              />
            </div>
          )}
        </div>
      </div>

      <InterviewDialog
        open={interviewOpen}
        personaId={interviewPersonaId}
        changedPageCount={interviewChangedCount}
        onClose={() => setInterviewOpen(false)}
      />
    </MainLayout>
  )
}

function EditableSlide({
  page,
  content,
  onChange,
}: {
  page: ProposalPage
  content: string
  onChange: (content: string) => void
}) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">
          ページ {page.page_number}
          {page.title && ` — ${page.title}`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <><Pencil className="h-3 w-3 mr-1" />エディタ</>
          ) : (
            <><Eye className="h-3 w-3 mr-1" />プレビュー</>
          )}
        </Button>
      </div>

      {showPreview ? (
        <div className="bg-white rounded-lg shadow-lg border p-8 min-h-[400px]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="w-full bg-white rounded-lg shadow-lg border p-6 min-h-[400px] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      )}
    </div>
  )
}
