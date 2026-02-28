import { TrendingUp, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TrendImpactData } from '@/types'

interface TrendImpactProps {
  data: TrendImpactData
}

export function TrendImpact({ data }: TrendImpactProps) {
  if (!data) return null
  const hasTrends = data.relevant_trends?.length > 0
  const hasAnalysis = !!data.impact_analysis
  if (!hasTrends && !hasAnalysis) return null

  return (
    <div className="rounded-md border border-orange-200 bg-orange-50 p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-4 w-4 text-orange-600" />
        <span className="text-sm font-medium text-orange-700">市場トレンド影響</span>
      </div>

      {hasTrends && (
        <div className="flex flex-wrap gap-1 mb-2">
          {data.relevant_trends.map((trend, i) => (
            <Badge key={i} className="bg-orange-100 text-orange-700 text-xs">{trend}</Badge>
          ))}
        </div>
      )}

      {hasAnalysis && (
        <p className="text-sm text-orange-800 mb-2">{data.impact_analysis}</p>
      )}

      {data.recommendations?.length > 0 && (
        <div className="space-y-1">
          {data.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-600 mt-0.5 shrink-0" />
              <span className="text-xs text-orange-700">{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
