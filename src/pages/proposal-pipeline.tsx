import { useState, useEffect, useCallback, useRef } from 'react'
import useSWR from 'swr'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { fetcher } from '@/lib/api'
import { StageProgress } from '@/components/pipeline/StageProgress'
import { SectionOutput } from '@/components/pipeline/SectionOutput'
import { RunHistory } from '@/components/pipeline/RunHistory'
import { MeetingMinute, PipelineStageInfo, PipelineSSEEvent } from '@/types'
import { Play, Loader2, FileText, Zap, Presentation } from 'lucide-react'
import { pipelineToMarkdown } from '@/lib/presentation'
import { PresentationWizardDialog } from '@/components/presentation/PresentationWizardDialog'

interface PaginatedResponse<T> {
  items: T[]
  total: number
}

export default function ProposalPipelinePage() {
  const { toast } = useToast()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Meeting minute selector
  const [selectedMinuteId, setSelectedMinuteId] = useState<string>('')
  const { data: minutesData } = useSWR<PaginatedResponse<MeetingMinute>>(
    isAuthenticated ? '/api/sales/meeting-minutes?page_size=100' : null,
    fetcher
  )
  const meetings = minutesData?.items ?? []

  // Pipeline state
  const [isRunning, setIsRunning] = useState(false)
  const [stages, setStages] = useState<PipelineStageInfo[]>([])
  const [currentStage, setCurrentStage] = useState<number | null>(null)
  const [sections, setSections] = useState<
    { stage: number; name: string; content: string; isStreaming?: boolean }[]
  >([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [loadingRun, setLoadingRun] = useState(false)
  const [showPresentation, setShowPresentation] = useState(false)
  const [pipelineRunId, setPipelineRunId] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Elapsed time timer
  useEffect(() => {
    if (isRunning) {
      const start = Date.now()
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - start)
      }, 100)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  const handleSSEEvent = useCallback((event: PipelineSSEEvent) => {
    switch (event.type) {
      case 'pipeline_start':
        setStages([])
        setSections([])
        break

      case 'stage_start':
        if (event.stage != null) {
          setCurrentStage(event.stage)
          if (event.skipped) {
            setStages((prev) => [
              ...prev.filter((s) => s.stage !== event.stage),
              {
                stage: event.stage!,
                name: event.name || `Stage ${event.stage}`,
                status: 'skipped',
              },
            ])
          } else {
            setStages((prev) => [
              ...prev.filter((s) => s.stage !== event.stage),
              {
                stage: event.stage!,
                name: event.name || `Stage ${event.stage}`,
                status: 'running',
              },
            ])
            // Add empty section for streaming content
            setSections((prev) => [
              ...prev.filter((s) => s.stage !== event.stage),
              {
                stage: event.stage!,
                name: event.name || `Stage ${event.stage}`,
                content: '',
                isStreaming: true,
              },
            ])
          }
        }
        break

      case 'stage_info':
        if (event.stage != null && event.content) {
          setSections((prev) =>
            prev.map((s) =>
              s.stage === event.stage
                ? { ...s, content: s.content + event.content + '\n' }
                : s
            )
          )
        }
        break

      case 'stage_chunk':
        if (event.stage != null && event.content) {
          setSections((prev) =>
            prev.map((s) =>
              s.stage === event.stage
                ? { ...s, content: s.content + event.content }
                : s
            )
          )
        }
        break

      case 'stage_complete':
        if (event.stage != null) {
          setStages((prev) =>
            prev.map((s) =>
              s.stage === event.stage
                ? { ...s, status: 'completed', duration_ms: event.duration_ms }
                : s
            )
          )
          setSections((prev) =>
            prev.map((s) =>
              s.stage === event.stage ? { ...s, isStreaming: false } : s
            )
          )
        }
        break

      case 'pipeline_complete':
        break

      case 'result':
        if (event.run_id) {
          setPipelineRunId(event.run_id)
        }
        break

      case 'error':
        if (event.stage != null) {
          setStages((prev) =>
            prev.map((s) =>
              s.stage === event.stage ? { ...s, status: 'error' } : s
            )
          )
          setSections((prev) =>
            prev.map((s) =>
              s.stage === event.stage
                ? {
                    ...s,
                    content: s.content + `\n\nエラー: ${event.error || '不明なエラー'}`,
                    isStreaming: false,
                  }
                : s
            )
          )
        }
        break
    }
  }, [])

  const executePipeline = useCallback(async () => {
    if (!selectedMinuteId || isRunning) return

    setIsRunning(true)
    setStages([])
    setSections([])
    setCurrentStage(null)
    setElapsedTime(0)
    setSelectedRunId(null)
    setPipelineRunId(null)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch('/api/sales/proposal-pipeline/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minute_id: selectedMinuteId }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let sseBuffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        sseBuffer += decoder.decode(value, { stream: true })
        const lines = sseBuffer.split('\n')
        sseBuffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as PipelineSSEEvent
              handleSSEEvent(data)
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      toast({ title: '完了', description: 'パイプラインの実行が完了しました' })
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast({
          variant: 'destructive',
          title: 'エラー',
          description:
            error instanceof Error
              ? error.message
              : 'パイプラインの実行中にエラーが発生しました',
        })
      }
    } finally {
      setIsRunning(false)
      setCurrentStage(null)
      abortRef.current = null
      setRefreshKey((k) => k + 1)
    }
  }, [selectedMinuteId, isRunning, handleSSEEvent, toast])

  // Load past run result
  const handleSelectRun = useCallback(async (runId: string) => {
    if (isRunning || loadingRun) return
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
        // Build stages from stage_results (includes stage 0)
        const STAGE_NAMES: Record<number, string> = {
          0: 'コンテキスト収集', 1: '課題構造化 + BANT-C',
          2: '逆算プランニング', 3: 'アクションプラン詳細化',
          4: '原稿提案生成', 5: 'チェックリスト + まとめ',
        }
        const stageResults = data.stage_results as Record<string, { status?: string; duration_ms?: number }> | null
        const builtStages = Array.from({ length: 6 }, (_, i) => {
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
  }, [isRunning, loadingRun, toast])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const selectedMinute = meetings.find((m) => m.id === selectedMinuteId)

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="提案パイプライン - Sales AI">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            提案パイプライン
          </h1>
          <p className="text-gray-500 mt-1">
            議事録から6段階のLLMチェーンで構造化提案書を自動生成します
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left panel: Controls + Progress */}
          <div className="lg:col-span-1 space-y-4">
            {/* Meeting minute selector */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  議事録選択
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedMinuteId}
                  onChange={(e) => setSelectedMinuteId(e.target.value)}
                  disabled={isRunning}
                >
                  <option value="">議事録を選択...</option>
                  {meetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.company_name}
                      {m.meeting_date ? ` (${m.meeting_date})` : ''}
                    </option>
                  ))}
                </select>

                {selectedMinute && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">企業:</span>{' '}
                      {selectedMinute.company_name}
                    </p>
                    {selectedMinute.industry && (
                      <p>
                        <span className="font-medium">業種:</span>{' '}
                        {selectedMinute.industry}
                      </p>
                    )}
                    {selectedMinute.area && (
                      <p>
                        <span className="font-medium">地域:</span>{' '}
                        {selectedMinute.area}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">ステータス:</span>{' '}
                      {selectedMinute.status}
                    </p>
                  </div>
                )}

                <Button
                  className="w-full mt-3"
                  onClick={executePipeline}
                  disabled={!selectedMinuteId || isRunning}
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      実行中...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      提案書を生成
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Stage progress */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium">
                  ステージ進捗
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <StageProgress
                  stages={stages}
                  currentStage={currentStage}
                  elapsedTime={elapsedTime}
                  isRunning={isRunning}
                />
              </CardContent>
            </Card>

            {/* Run history */}
            <Card>
              <CardContent className="p-4">
                <RunHistory
                  refreshKey={refreshKey}
                  selectedRunId={selectedRunId}
                  onSelectRun={handleSelectRun}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main panel: Section output */}
          <div className="lg:col-span-3">
            <SectionOutput sections={sections} />
            {sections.length > 0 && !isRunning && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowPresentation(true)}
                >
                  <Presentation className="h-4 w-4 mr-2" />
                  結果からプレゼン作成
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <PresentationWizardDialog
        open={showPresentation}
        onOpenChange={setShowPresentation}
        initialContent={pipelineToMarkdown(sections)}
        downloadTitle={
          selectedMinute
            ? `提案書_${selectedMinute.company_name}${selectedMinute.meeting_date ? `_${selectedMinute.meeting_date}` : ''}`
            : undefined
        }
        pipelineRunId={pipelineRunId ?? undefined}
      />
    </MainLayout>
  )
}
