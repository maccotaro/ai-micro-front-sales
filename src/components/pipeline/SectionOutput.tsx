import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Stage2Output, SalesCoaching, FollowUpActions, FactCheckResult, ReferenceDocument } from '@/types'
import { ShochikubaiComparison, BudgetRange } from './ShochikubaiComparison'
import { ReverseTimeline } from './ReverseTimeline'
import { SeasonalContext } from './SeasonalContext'
import { TrendImpact } from './TrendImpact'
import { CoachingTips } from './CoachingTips'
import { FollowupActions } from './FollowupActions'
import { FactCheckWarnings } from './FactCheckWarnings'
import { ResourceLinks } from './ResourceLinks'

interface SectionOutputProps {
  sections: { stage: number; name: string; content: string; isStreaming?: boolean }[]
}

function tryParseJSON(content: string): Record<string, unknown> | null {
  try {
    const trimmed = content.trim()
    // Skip if content looks like markdown (starts with # or -)
    if (trimmed.startsWith('#') || trimmed.startsWith('-')) return null
    // Try to find JSON in content (may be wrapped in markdown code block)
    let jsonStr = trimmed
    if (jsonStr.startsWith('```')) {
      const lines = jsonStr.split('\n')
      lines.shift() // remove ```json
      if (lines[lines.length - 1]?.trim() === '```') lines.pop()
      jsonStr = lines.join('\n')
    }
    const parsed = JSON.parse(jsonStr)
    return typeof parsed === 'object' && parsed !== null ? parsed : null
  } catch {
    return null
  }
}

function extractBudgetFromStage1(sections: SectionOutputProps['sections']): BudgetRange | null {
  const stage1 = sections.find((s) => s.stage === 1)
  if (!stage1?.content) return null
  const parsed = tryParseJSON(stage1.content)
  if (!parsed) return null
  const issues = (parsed as Record<string, unknown>).issues as Array<Record<string, unknown>> | undefined
  if (!issues?.length) return null
  for (const issue of issues) {
    const bant = issue.bant_c as Record<string, unknown> | undefined
    const budget = bant?.budget as Record<string, unknown> | undefined
    const est = budget?.estimated_range as { min?: number | null; max?: number | null } | undefined
    if (est && (est.min != null || est.max != null)) {
      return { min: est.min ?? null, max: est.max ?? null }
    }
  }
  return null
}

function StructuredContent({ stage, content, isStreaming, allSections }: {
  stage: number
  content: string
  isStreaming?: boolean
  allSections: SectionOutputProps['sections']
}) {
  const parsed = useMemo(() => {
    if (isStreaming) return null
    return tryParseJSON(content)
  }, [content, isStreaming])

  if (!parsed) return null

  if (stage === 2) {
    const data = parsed as unknown as Stage2Output
    const hasShochikubai = data.proposals?.[0]?.shochikubai
    if (!hasShochikubai && !data.reverse_timeline && !data.seasonal_context && !data.trend_impact) return null
    const customerBudget = hasShochikubai ? extractBudgetFromStage1(allSections) : null
    return (
      <>
        {hasShochikubai && (
          <ShochikubaiComparison
            proposals={data.proposals}
            totalBudgetRange={data.total_budget_range}
            customerBudget={customerBudget}
          />
        )}
        {data.reverse_timeline && <ReverseTimeline entries={data.reverse_timeline} />}
        {data.seasonal_context && <SeasonalContext context={data.seasonal_context} />}
        {data.trend_impact && <TrendImpact data={data.trend_impact} />}
      </>
    )
  }

  if (stage === 3) {
    const coaching = (parsed as Record<string, unknown>).sales_coaching as SalesCoaching | undefined
    const followUp = (parsed as Record<string, unknown>).follow_up_actions as FollowUpActions | undefined
    if (!coaching && !followUp) return null
    return (
      <>
        {coaching && <CoachingTips coaching={coaching} />}
        {followUp && <FollowupActions actions={followUp} />}
      </>
    )
  }

  if (stage === 5) {
    const factCheck = (parsed as Record<string, unknown>).fact_check as FactCheckResult | undefined
    const refDocs = (parsed as Record<string, unknown>).reference_documents as ReferenceDocument[] | undefined
    if (!factCheck && !refDocs?.length) return null
    return (
      <>
        {factCheck && <FactCheckWarnings factCheck={factCheck} />}
        {refDocs && refDocs.length > 0 && <ResourceLinks documents={refDocs} />}
      </>
    )
  }

  return null
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
  allSections,
  defaultOpen = true,
}: {
  stage: number
  name: string
  content: string
  isStreaming?: boolean
  allSections: SectionOutputProps['sections']
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Check if structured content will render (to hide raw markdown/JSON)
  const hasStructured = useMemo(() => {
    if (isStreaming) return false
    const parsed = tryParseJSON(content)
    if (!parsed) return false
    if (stage === 2) {
      const data = parsed as unknown as Stage2Output
      return !!(data.proposals?.[0]?.shochikubai || data.reverse_timeline || data.seasonal_context || data.trend_impact)
    }
    if (stage === 3) {
      return !!((parsed as Record<string, unknown>).sales_coaching || (parsed as Record<string, unknown>).follow_up_actions)
    }
    if (stage === 5) {
      return !!((parsed as Record<string, unknown>).fact_check || ((parsed as Record<string, unknown>).reference_documents as unknown[] | undefined)?.length)
    }
    return false
  }, [content, isStreaming, stage])

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
          isOpen ? 'max-h-[5000px]' : 'max-h-0'
        )}
      >
        <CardContent className="pt-0 px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
            <StructuredContent stage={stage} content={content} isStreaming={isStreaming} allSections={allSections} />
            {!hasStructured && <MarkdownContent content={content} />}
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
      {sections.map((section, idx) => (
        <SectionCard
          key={`${section.stage}-${idx}`}
          stage={section.stage}
          name={section.name}
          content={section.content}
          isStreaming={section.isStreaming}
          allSections={sections}
        />
      ))}
    </div>
  )
}
