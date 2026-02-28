import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { fetcher } from '@/lib/api'
import { usePipelineRun } from '@/hooks/use-pipeline-run'
import { StageProgress } from '@/components/pipeline/StageProgress'
import { SectionOutput } from '@/components/pipeline/SectionOutput'
import { RunHistory } from '@/components/pipeline/RunHistory'
import { AnalysisSummary } from '@/components/pipeline/AnalysisSummary'
import { MeetingMinute, PaginatedResponse, PipelineRun, PipelineSSEEvent } from '@/types'
import { Play, Loader2, FileText, Zap, Presentation, ArrowLeft } from 'lucide-react'
import { pipelineToMarkdown } from '@/lib/presentation'
import { PresentationWizardDialog } from '@/components/presentation/PresentationWizardDialog'

export default function ProposalPipelinePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Meeting minute selector
  const [selectedMinuteId, setSelectedMinuteId] = useState<string>('')
  const { data: minutesData } = useSWR<PaginatedResponse<MeetingMinute>>(
    isAuthenticated ? '/api/sales/meeting-minutes?page_size=100' : null,
    fetcher
  )
  const meetings = minutesData?.items ?? []

  // Whether user navigated from meeting detail
  const fromMeeting = router.query.from === 'meeting'

  // Auto-select from query param
  useEffect(() => {
    const qMinuteId = router.query.minute_id
    if (!qMinuteId || typeof qMinuteId !== 'string') return
    if (meetings.length === 0) return
    if (meetings.some((m) => m.id === qMinuteId)) {
      setSelectedMinuteId(qMinuteId)
    }
  }, [router.query.minute_id, meetings])

  // Auto-load latest completed run when show_result=1
  const showResult = router.query.show_result === '1'
  const autoLoadMinuteId = showResult ? (router.query.minute_id as string) : null
  const { data: autoRunsData } = useSWR<{ runs: PipelineRun[] }>(
    autoLoadMinuteId
      ? `/api/sales/proposal-pipeline/runs?minute_id=${autoLoadMinuteId}&page=1&page_size=1`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Pipeline run hook (for loading past results)
  const {
    selectedRunId,
    sections,
    stages,
    pipelineRunId,
    setSections,
    setStages,
    setPipelineRunId,
    handleSelectRun,
    resetSelection,
  } = usePipelineRun()

  // Auto-select latest completed run when navigated with show_result=1
  const autoLoadedRef = useRef(false)
  useEffect(() => {
    if (!showResult || autoLoadedRef.current) return
    const latestRun = autoRunsData?.runs?.[0]
    if (latestRun && latestRun.status === 'completed') {
      autoLoadedRef.current = true
      handleSelectRun(latestRun.id)
    }
  }, [autoRunsData, showResult, handleSelectRun])

  // Pipeline execution state
  const [isRunning, setIsRunning] = useState(false)
  const [currentStage, setCurrentStage] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showPresentation, setShowPresentation] = useState(false)
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
        // Replace entire sections array with template sections from result.
        // This is needed because the output template can have multiple sections
        // per stage (e.g. 'agenda' + 'proposal' both stage 2).
        if (event.sections?.length) {
          setSections(
            event.sections.map((rs) => ({
              stage: rs.stage,
              name: rs.title,
              content: rs.content,
              isStreaming: false,
            }))
          )
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
  }, [setSections, setStages, setPipelineRunId])

  const executePipeline = useCallback(async () => {
    if (!selectedMinuteId || isRunning) return

    setIsRunning(true)
    setStages([])
    setSections([])
    setCurrentStage(null)
    setElapsedTime(0)
    resetSelection()

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
  }, [selectedMinuteId, isRunning, handleSSEEvent, toast, setSections, setStages, resetSelection])

  // Wrap handleSelectRun to block during pipeline execution
  const onSelectRun = useCallback((runId: string) => {
    if (isRunning) return
    handleSelectRun(runId)
  }, [isRunning, handleSelectRun])

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {fromMeeting && selectedMinuteId && (
              <Link href={`/meetings/${selectedMinuteId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="h-6 w-6" />
                提案パイプライン
              </h1>
              <p className="text-gray-500 mt-1">
                議事録から6段階のLLMチェーンで構造化提案書を自動生成します
              </p>
            </div>
          </div>
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

                {selectedMinute && (
                  <AnalysisSummary parsedJson={selectedMinute.parsed_json} />
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
                  onSelectRun={onSelectRun}
                  minuteId={selectedMinuteId || undefined}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main panel: Section output */}
          <div className="lg:col-span-3">
            <SectionOutput sections={sections} />
            {sections.length > 0 && !isRunning && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedMinuteId && (
                    <Link href={`/meetings/${selectedMinuteId}`}>
                      <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        議事録に戻る
                      </Button>
                    </Link>
                  )}
                </div>
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
