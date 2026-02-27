import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface SectionOutputProps {
  sections: { stage: number; name: string; content: string; isStreaming?: boolean }[]
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border-collapse border border-gray-300 text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-200">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-2 py-1 text-left font-medium">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-2 py-1">{children}</td>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.startsWith('language-')
            if (isBlock) {
              return (
                <pre className="bg-gray-800 text-gray-100 rounded p-3 overflow-x-auto text-xs my-2">
                  <code className={className} {...props}>{children}</code>
                </pre>
              )
            }
            return (
              <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs" {...props}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => <>{children}</>,
          p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5 text-sm">{children}</li>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 text-gray-900">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-1.5 mt-3 text-gray-900">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-3 text-gray-800">{children}</h3>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-gray-300 pl-3 my-2 text-gray-600 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-gray-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function SectionCard({
  stage,
  name,
  content,
  isStreaming,
  defaultOpen = true,
}: {
  stage: number
  name: string
  content: string
  isStreaming?: boolean
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="py-3 px-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {stage}
            </span>
            {name}
            {isStreaming && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            )}
          </CardTitle>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </CardHeader>
      <div
        className={cn(
          'transition-all duration-200 overflow-hidden',
          isOpen ? 'max-h-[2000px]' : 'max-h-0'
        )}
      >
        <CardContent className="pt-0 px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <MarkdownContent content={content} />
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-0.5" />
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export function SectionOutput({ sections }: SectionOutputProps) {
  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <p className="text-sm">パイプラインを実行すると、各ステージの結果がここに表示されます</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <SectionCard
          key={section.stage}
          stage={section.stage}
          name={section.name}
          content={section.content}
          isStreaming={section.isStreaming}
        />
      ))}
    </div>
  )
}
