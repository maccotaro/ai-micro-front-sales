import { PipelineStageInfo } from '@/types'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Loader2, SkipForward, AlertCircle } from 'lucide-react'

const STAGE_NAMES: Record<number, string> = {
  0: 'コンテキスト収集',
  1: '課題構造化 + BANT-C',
  2: '逆算プランニング',
  3: 'アクションプラン詳細化',
  4: '原稿提案生成',
  5: 'チェックリスト + まとめ',
}

interface StageProgressProps {
  stages: PipelineStageInfo[]
  currentStage: number | null
  elapsedTime: number
  isRunning: boolean
}

function StageIcon({ status }: { status: PipelineStageInfo['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    case 'running':
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    case 'skipped':
      return <SkipForward className="h-5 w-5 text-gray-400" />
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />
    default:
      return <Circle className="h-5 w-5 text-gray-300" />
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function StageProgress({ stages, currentStage, elapsedTime, isRunning }: StageProgressProps) {
  const completedCount = stages.filter((s) => s.status === 'completed' || s.status === 'skipped').length
  const progressPercent = Math.min((completedCount / 6) * 100, 100)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {isRunning
            ? currentStage !== null
              ? `Stage ${currentStage}: ${STAGE_NAMES[currentStage] || ''}`
              : '開始中...'
            : completedCount === 6
              ? '完了'
              : '待機中'}
        </span>
        {isRunning && (
          <span className="text-gray-500">{formatDuration(elapsedTime)}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            completedCount === 6 ? 'bg-green-500' : 'bg-blue-500'
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stage list */}
      <div className="space-y-1">
        {Array.from({ length: 6 }, (_, i) => {
          const stage = stages.find((s) => s.stage === i)
          const status = stage?.status || 'pending'
          return (
            <div
              key={i}
              className={cn(
                'flex items-center justify-between px-3 py-1.5 rounded text-sm',
                status === 'running' && 'bg-blue-50',
                status === 'error' && 'bg-red-50'
              )}
            >
              <div className="flex items-center gap-2">
                <StageIcon status={status} />
                <span
                  className={cn(
                    status === 'running' && 'font-medium text-blue-700',
                    status === 'completed' && 'text-gray-700',
                    status === 'skipped' && 'text-gray-400',
                    status === 'error' && 'text-red-700',
                    status === 'pending' && 'text-gray-400'
                  )}
                >
                  {stage?.name || STAGE_NAMES[i]}
                </span>
              </div>
              {stage?.duration_ms != null && (
                <span className="text-xs text-gray-400">
                  {formatDuration(stage.duration_ms)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
