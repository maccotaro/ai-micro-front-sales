import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { PipelineStageInfo } from '@/types'

export const STAGE_NAMES: Record<number, string> = {
  0: 'コンテキスト収集',
  1: '課題構造化 + BANT-C',
  2: '逆算プランニング',
  3: 'アクションプラン詳細化',
  4: '原稿提案生成',
  5: 'チェックリスト + まとめ',
  6: '提案コンテキスト収集',
  7: '業界・ターゲット分析',
  8: '訴求戦略立案',
  9: 'ストーリー構成',
  10: 'ページ生成',
}

export interface PipelineSection {
  stage: number
  name: string
  content: string
  isStreaming?: boolean
}

export function usePipelineRun() {
  const { toast } = useToast()
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [loadingRun, setLoadingRun] = useState(false)
  const [sections, setSections] = useState<PipelineSection[]>([])
  const [stages, setStages] = useState<PipelineStageInfo[]>([])
  const [pipelineRunId, setPipelineRunId] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)

  const handleSelectRun = useCallback(async (runId: string) => {
    if (loadingRun) return
    setLoadingRun(true)
    setSelectedRunId(runId)
    setPipelineRunId(runId)
    try {
      const res = await fetch(`/api/sales/proposal-pipeline/runs/${runId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.sections && Array.isArray(data.sections)) {
        setSections(
          data.sections.map((s: { stage: number; title: string; content: string }) => ({
            stage: s.stage,
            name: s.title,
            content: s.content || '',
            isStreaming: false,
          }))
        )
        const stageResults = data.stage_results as Record<string, { status?: string; duration_ms?: number }> | null
        if (data.document_id) {
          setDocumentId(data.document_id)
        }
        const stageCount = Math.max(6, ...Object.keys(stageResults || {}).map(Number).filter(n => !isNaN(n))) + 1
        const builtStages = Array.from({ length: Math.min(stageCount, 11) }, (_, i) => {
          const sr = stageResults?.[String(i)]
          return {
            stage: i,
            name: STAGE_NAMES[i] || `Stage ${i}`,
            status: (sr?.status === 'completed' ? 'completed'
              : sr?.status === 'skipped' ? 'skipped'
              : sr?.status === 'failed' ? 'error'
              : 'completed') as 'completed' | 'skipped' | 'error' | 'pending',
            duration_ms: sr?.duration_ms,
          }
        })
        setStages(builtStages)
      } else {
        toast({
          variant: 'destructive',
          title: 'データなし',
          description: 'この実行結果の詳細データは保存されていません',
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: '実行結果の取得に失敗しました',
      })
    } finally {
      setLoadingRun(false)
    }
  }, [loadingRun, toast])

  const resetSelection = useCallback(() => {
    setSelectedRunId(null)
    setPipelineRunId(null)
    setDocumentId(null)
    setSections([])
    setStages([])
  }, [])

  return {
    selectedRunId,
    loadingRun,
    sections,
    stages,
    pipelineRunId,
    documentId,
    setSections,
    setStages,
    setPipelineRunId,
    setSelectedRunId,
    setDocumentId,
    handleSelectRun,
    resetSelection,
  }
}
