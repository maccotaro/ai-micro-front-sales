import { FileText, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ReferenceDocument } from '@/types'

interface ResourceLinksProps {
  documents: ReferenceDocument[]
}

const CATEGORY_COLORS: Record<string, string> = {
  '料金表': 'bg-blue-100 text-blue-700',
  '事例集': 'bg-green-100 text-green-700',
  '媒体ガイド': 'bg-purple-100 text-purple-700',
  'その他': 'bg-gray-100 text-gray-600',
}

export function ResourceLinks({ documents }: ResourceLinksProps) {
  if (!documents?.length) return null

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">参考資料</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {documents.map((doc, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded border border-gray-200 bg-white p-2 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-800 truncate">{doc.name}</span>
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3 text-blue-500" />
                  </a>
                )}
              </div>
              {doc.category && (
                <Badge className={`text-[10px] px-1.5 py-0 mt-0.5 ${CATEGORY_COLORS[doc.category] || CATEGORY_COLORS['その他']}`}>
                  {doc.category}
                </Badge>
              )}
              {doc.usage && (
                <p className="text-xs text-gray-500 mt-0.5">{doc.usage}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
