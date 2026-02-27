import { Button } from '@/components/ui/button'
import { Loader2, Download, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { TaskStatusResponse } from '@/lib/presentation'

type GenerateState = 'idle' | 'submitting' | 'polling' | 'completed' | 'failed'

interface PresentationProgressProps {
  state: GenerateState
  status: TaskStatusResponse | null
  error: string | null
  onDownload: () => void
  onRetry: () => void
}

const statusMessages: Record<string, string> = {
  pending: 'タスクを準備中...',
  processing: 'スライドを生成中...',
  completed: '生成が完了しました',
  failed: '生成に失敗しました',
}

export function PresentationProgress({
  state,
  status,
  error,
  onDownload,
  onRetry,
}: PresentationProgressProps) {
  const isProcessing = state === 'submitting' || state === 'polling'

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      {/* Status icon */}
      {isProcessing && (
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-gray-600">
            {state === 'submitting'
              ? 'リクエストを送信中...'
              : statusMessages[status?.status || 'processing']}
          </p>
          {status?.message && (
            <p className="text-xs text-gray-500">{status.message}</p>
          )}
        </div>
      )}

      {state === 'completed' && (
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="text-sm font-medium text-gray-700">
            プレゼンテーションが完成しました
          </p>
          {status?.result?.slides_count && (
            <p className="text-xs text-gray-500">
              {status.result.slides_count}枚のスライド
            </p>
          )}
          <div className="flex gap-3">
            <Button onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              ダウンロード
            </Button>
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              再生成
            </Button>
          </div>
        </div>
      )}

      {state === 'failed' && (
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-sm font-medium text-red-600">
            生成に失敗しました
          </p>
          {error && (
            <p className="text-xs text-gray-500 max-w-sm text-center">{error}</p>
          )}
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            再試行
          </Button>
        </div>
      )}
    </div>
  )
}
