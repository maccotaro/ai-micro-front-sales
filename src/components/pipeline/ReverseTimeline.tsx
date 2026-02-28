import { cn } from '@/lib/utils'
import { ReverseTimelineEntry } from '@/types'
import { Badge } from '@/components/ui/badge'

interface ReverseTimelineProps {
  entries: ReverseTimelineEntry[]
}

const URGENT_KEYWORDS = ['キャンペーン', '締切', '期限', '緊急']

function isUrgent(entry: ReverseTimelineEntry): boolean {
  const text = `${entry.milestone} ${entry.action}`
  return URGENT_KEYWORDS.some((kw) => text.includes(kw))
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return dateStr
  }
}

export function ReverseTimeline({ entries }: ReverseTimelineProps) {
  if (!entries?.length) return null

  const sorted = [...entries].sort((a, b) => {
    const da = new Date(a.date).getTime()
    const db = new Date(b.date).getTime()
    if (isNaN(da) || isNaN(db)) return 0
    return da - db
  })

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">逆算タイムライン</h4>
      <div className="relative pl-6">
        {sorted.map((entry, i) => {
          const urgent = isUrgent(entry)
          return (
            <div key={i} className="relative pb-4 last:pb-0">
              {/* Connector line */}
              {i < sorted.length - 1 && (
                <div className={cn(
                  'absolute left-[-18px] top-3 w-0.5 h-full',
                  urgent ? 'bg-red-300' : 'bg-gray-200'
                )} />
              )}
              {/* Dot */}
              <div className={cn(
                'absolute left-[-22px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white',
                urgent ? 'bg-red-500' : 'bg-blue-500'
              )} />
              {/* Content */}
              <div className={cn(
                'rounded-md p-2 border',
                urgent ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
              )}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-gray-500">{formatDate(entry.date)}</span>
                  <span className="text-sm font-medium text-gray-800">{entry.milestone}</span>
                  {urgent && (
                    <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0">緊急</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">{entry.action}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
