import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'

interface ProposalPage {
  id: string
  page_number: number
  title: string | null
  purpose: string | null
}

interface PageListProps {
  pages: ProposalPage[]
  selectedPageId: string | null
  onSelectPage: (pageId: string) => void
}

export function PageList({ pages, selectedPageId, onSelectPage }: PageListProps) {
  const sorted = [...pages].sort((a, b) => a.page_number - b.page_number)

  return (
    <div className="py-2">
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
        ページ一覧
      </div>
      {sorted.map((page) => (
        <button
          key={page.id}
          onClick={() => onSelectPage(page.id)}
          className={cn(
            'w-full text-left px-3 py-2 text-sm flex items-start gap-2 hover:bg-gray-100 transition-colors',
            selectedPageId === page.id && 'bg-blue-50 border-r-2 border-blue-500',
          )}
        >
          <span className="flex-shrink-0 w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            {page.page_number}
          </span>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {page.title || `ページ ${page.page_number}`}
            </div>
            {page.purpose && (
              <div className="text-xs text-gray-500 truncate">{page.purpose}</div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
