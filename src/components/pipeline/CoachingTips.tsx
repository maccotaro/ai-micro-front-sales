import { Lightbulb, MessageSquare, Shield, ListOrdered } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SalesCoaching } from '@/types'

interface CoachingTipsProps {
  coaching: SalesCoaching
}

export function CoachingTips({ coaching }: CoachingTipsProps) {
  if (!coaching) return null
  const hasQuestions = coaching.deep_dive_questions?.length > 0
  const hasObjections = coaching.objection_handling?.length > 0
  const hasScript = coaching.talk_script_outline?.length > 0
  if (!hasQuestions && !hasObjections && !hasScript) return null

  return (
    <div className="rounded-md border border-purple-200 bg-purple-50 p-3 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-purple-700">セールスコーチング</span>
      </div>

      {/* Deep dive questions */}
      {hasQuestions && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
            <span className="text-xs font-medium text-purple-700">深掘り質問</span>
          </div>
          <div className="space-y-2">
            {coaching.deep_dive_questions.map((q, i) => (
              <div key={i} className="bg-white rounded p-2 border border-purple-100">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-medium text-gray-700">{q.topic}</span>
                  <span className="text-[10px] text-gray-400">({q.related_issue_id})</span>
                </div>
                <p className="text-sm text-gray-800">{q.question}</p>
                {q.follow_up && (
                  <p className="text-xs text-gray-500 mt-0.5">→ {q.follow_up}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objection handling */}
      {hasObjections && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Shield className="h-3.5 w-3.5 text-purple-500" />
            <span className="text-xs font-medium text-purple-700">反論対応</span>
          </div>
          <div className="space-y-2">
            {coaching.objection_handling.map((obj, i) => (
              <div key={i} className="bg-white rounded p-2 border border-purple-100">
                <p className="text-xs text-red-600 font-medium mb-0.5">「{obj.objection}」</p>
                <p className="text-sm text-gray-800">{obj.response}</p>
                <p className="text-xs text-gray-500 mt-0.5">根拠: {obj.evidence}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Talk script outline */}
      {hasScript && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ListOrdered className="h-3.5 w-3.5 text-purple-500" />
            <span className="text-xs font-medium text-purple-700">トークスクリプト</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {coaching.talk_script_outline.map((phase, i) => (
              <div key={i} className={cn(
                'rounded px-2 py-1 border text-xs',
                'bg-white border-purple-100'
              )}>
                <span className="font-medium text-gray-700">{phase.title}</span>
                <span className="text-gray-400 ml-1">({phase.duration_minutes}分)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
