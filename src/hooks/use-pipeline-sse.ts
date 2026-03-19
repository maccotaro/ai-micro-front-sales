import { useCallback } from 'react'
import type { PipelineSSEEvent } from '@/types'
import type { PipelineSection } from './use-pipeline-run'

interface UsePipelineSSEOptions {
  setSections: React.Dispatch<React.SetStateAction<PipelineSection[]>>
  setStages: React.Dispatch<React.SetStateAction<any[]>>
  setPipelineRunId: (id: string | null) => void
  setDocumentId: (id: string | null) => void
  setPipelineName: (name: string) => void
}

export function usePipelineSSE({
  setSections,
  setStages,
  setPipelineRunId,
  setDocumentId,
  setPipelineName,
}: UsePipelineSSEOptions) {
  const handleSSEEvent = useCallback((event: PipelineSSEEvent) => {
    switch (event.type) {
      case 'pipeline_start':
        setStages([])
        setSections([])
        if (event.pipeline_name) {
          setPipelineName(event.pipeline_name)
        }
        break
      case 'stage_start':
        if (event.stage != null) {
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
      case 'stage_sections':
        if (event.sections?.length && event.stage != null) {
          setSections((prev) => {
            const filtered = prev.filter((s) => s.stage !== event.stage)
            const insertIdx = filtered.findIndex((s) => s.stage > event.stage!)
            const newSections = event.sections!.map((rs) => ({
              stage: rs.stage,
              name: rs.title,
              content: rs.content,
              isStreaming: false,
            }))
            if (insertIdx === -1) {
              return [...filtered, ...newSections]
            }
            return [
              ...filtered.slice(0, insertIdx),
              ...newSections,
              ...filtered.slice(insertIdx),
            ]
          })
        }
        break
      case 'pipeline_complete':
        break
      case 'result':
        if (event.run_id) {
          setPipelineRunId(event.run_id)
        }
        if (event.document_id) {
          setDocumentId(event.document_id)
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
  }, [setSections, setStages, setPipelineRunId, setDocumentId, setPipelineName])

  return { handleSSEEvent }
}
