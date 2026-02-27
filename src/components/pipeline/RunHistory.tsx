import useSWR from 'swr'
import { fetcher } from '@/lib/api'
import { PipelineRun } from '@/types'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { Clock, AlertCircle, CheckCircle2, Loader2, Eye, Download } from 'lucide-react'

interface RunHistoryProps {
  refreshKey?: number
  selectedRunId?: string | null
  onSelectRun?: (runId: string) => void
}

interface RunsResponse {
  runs: PipelineRun[]
  total: number
  page: number
  page_size: number
}

function statusBadge(status: string) {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="success" className="text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          完了
        </Badge>
      )
    case 'running':
      return (
        <Badge variant="default" className="text-xs">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          実行中
        </Badge>
      )
    case 'error':
    case 'failed':
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          エラー
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="text-xs">
          {status}
        </Badge>
      )
  }
}

function formatDuration(ms: number | null): string {
  if (ms == null) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function RunHistory({ refreshKey, selectedRunId, onSelectRun }: RunHistoryProps) {
  const { data, isLoading } = useSWR<RunsResponse>(
    `/api/sales/proposal-pipeline/runs?page=1&page_size=10&_k=${refreshKey || 0}`,
    fetcher,
    { refreshInterval: 0 }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  const runs = data?.runs || []

  if (runs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        実行履歴はありません
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">実行履歴</h3>
      {runs.map((run) => {
        const isSelected = selectedRunId === run.id
        const isClickable = onSelectRun && run.status === 'completed'

        return (
          <div
            key={run.id}
            className={`flex items-center justify-between p-3 border rounded-lg text-sm transition-colors ${
              isSelected
                ? 'bg-blue-50 border-blue-300'
                : isClickable
                  ? 'bg-white hover:bg-gray-50 cursor-pointer'
                  : 'bg-white'
            }`}
            onClick={() => isClickable && onSelectRun(run.id)}
          >
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {statusBadge(run.status)}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(run.total_duration_ms)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {formatDateTime(run.created_at)}
              </p>
              {run.error_message && (
                <p className="text-xs text-red-500 truncate max-w-[200px]">
                  Stage {run.error_stage}: {run.error_message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              {run.presentation_path && (
                <button
                  title="プレゼンをダウンロード"
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(
                      `/api/presentation/download?path=${encodeURIComponent(run.presentation_path!)}`,
                      '_blank',
                    )
                  }}
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
              {isClickable && (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
