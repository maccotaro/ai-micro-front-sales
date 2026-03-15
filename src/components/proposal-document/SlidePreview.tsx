import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ProposalPage {
  id: string
  page_number: number
  title: string | null
  markdown_content: string
  purpose: string | null
}

interface SlidePreviewProps {
  page: ProposalPage | null
}

export function SlidePreview({ page }: SlidePreviewProps) {
  if (!page) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        ページを選択してください
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Slide frame */}
      <div className="bg-white rounded-lg shadow-lg border p-8 min-h-[400px]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700">
                {children}
              </ol>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-100">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 px-3 py-2">{children}</td>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-400 pl-4 py-1 my-3 text-gray-600 italic bg-blue-50 rounded-r">
                {children}
              </blockquote>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-gray-900">{children}</strong>
            ),
          }}
        >
          {page.markdown_content}
        </ReactMarkdown>
      </div>

      {/* Page info */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        ページ {page.page_number}
        {page.purpose && ` — ${page.purpose}`}
      </div>
    </div>
  )
}
