import { Badge } from '@/components/ui/badge'
import { AlertCircle, Target } from 'lucide-react'
import { AnalysisResult } from '@/types'

interface AnalysisSummaryProps {
  parsedJson: AnalysisResult | null | undefined
}

export function AnalysisSummary({ parsedJson }: AnalysisSummaryProps) {
  if (!parsedJson) {
    return (
      <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-500 text-center">
        未解析
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-2">
      {parsedJson.summary && (
        <div className="p-2 bg-blue-50 rounded text-xs">
          <p className="font-medium text-blue-700 mb-1">要約</p>
          <p className="text-gray-700 line-clamp-3">{parsedJson.summary}</p>
        </div>
      )}
      {parsedJson.issues && parsedJson.issues.length > 0 && (
        <div className="p-2 bg-red-50 rounded text-xs">
          <p className="font-medium text-red-700 mb-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            課題 (上位{Math.min(3, parsedJson.issues.length)}件)
          </p>
          <ul className="space-y-1">
            {parsedJson.issues.slice(0, 3).map((issue, i) => (
              <li key={i} className="flex items-start gap-1 text-gray-700">
                <span className="shrink-0 mt-0.5">-</span>
                <span>{issue.issue}</span>
                {issue.priority && (
                  <Badge variant="outline" className="ml-auto shrink-0 text-[10px] px-1 py-0">
                    {issue.priority === 'high' ? '高' : issue.priority === 'medium' ? '中' : '低'}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {parsedJson.needs && parsedJson.needs.length > 0 && (
        <div className="p-2 bg-green-50 rounded text-xs">
          <p className="font-medium text-green-700 mb-1 flex items-center gap-1">
            <Target className="h-3 w-3" />
            ニーズ (上位{Math.min(3, parsedJson.needs.length)}件)
          </p>
          <ul className="space-y-1">
            {parsedJson.needs.slice(0, 3).map((need, i) => (
              <li key={i} className="flex items-start gap-1 text-gray-700">
                <span className="shrink-0 mt-0.5">-</span>
                <span>{need.need}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
