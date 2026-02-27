import { useState, useCallback, useRef } from 'react'
import type {
  GeneratePresentationRequest,
  AsyncTaskResponse,
  TaskStatusResponse,
  PresentationTemplate,
} from '@/lib/presentation'

type GenerateState = 'idle' | 'submitting' | 'polling' | 'completed' | 'failed'

interface UsePresentationGenerateOptions {
  onCompleted?: (filePath: string, format: string) => void
}

interface UsePresentationGenerateReturn {
  state: GenerateState
  taskId: string | null
  status: TaskStatusResponse | null
  error: string | null
  templates: PresentationTemplate[]
  templatesLoading: boolean
  fetchTemplates: () => Promise<void>
  generate: (request: GeneratePresentationRequest) => Promise<void>
  download: (title?: string) => void
  reset: () => void
}

const POLL_INTERVAL = 2000

export function usePresentationGenerate(
  options?: UsePresentationGenerateOptions,
): UsePresentationGenerateReturn {
  const [state, setState] = useState<GenerateState>('idle')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [status, setStatus] = useState<TaskStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<PresentationTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompletedRef = useRef(options?.onCompleted)
  onCompletedRef.current = options?.onCompleted

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    stopPolling()
    setState('idle')
    setTaskId(null)
    setStatus(null)
    setError(null)
  }, [stopPolling])

  const fetchTemplates = useCallback(async () => {
    setTemplatesLoading(true)
    try {
      const res = await fetch('/api/presentation/templates')
      if (!res.ok) throw new Error('Failed to fetch templates')
      const rawData = await res.json()
      const arr = Array.isArray(rawData) ? rawData : rawData.templates || []
      // Map Presenton API format (templateName/templateID) to our PresentationTemplate type
      const mapped: PresentationTemplate[] = arr.map((t: Record<string, unknown>) => ({
        name: (t.name || t.templateName || t.templateID) as string,
        display_name: (t.display_name || t.templateName || t.name) as string,
        description: ((t.settings as Record<string, unknown>)?.description || t.description || '') as string,
      }))
      setTemplates(mapped)
    } catch (err) {
      console.error('Failed to fetch templates:', err)
    } finally {
      setTemplatesLoading(false)
    }
  }, [])

  const pollStatus = useCallback((id: string) => {
    setState('polling')

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/presentation/status/${id}`)
        if (!res.ok) throw new Error('Status check failed')

        const data: TaskStatusResponse = await res.json()
        setStatus(data)

        if (data.status === 'completed') {
          stopPolling()
          setState('completed')
          const filePath = data.data?.path || data.result?.file_path
          if (filePath && onCompletedRef.current) {
            const fmt = filePath.endsWith('.pdf') ? 'pdf' : 'pptx'
            onCompletedRef.current(filePath, fmt)
          }
        } else if (data.status === 'failed' || data.status === 'error') {
          stopPolling()
          setState('failed')
          const errMsg = typeof data.error === 'string' ? data.error : data.error?.detail
          setError(errMsg || '生成に失敗しました')
        }
      } catch (err) {
        stopPolling()
        setState('failed')
        setError(err instanceof Error ? err.message : 'Polling error')
      }
    }, POLL_INTERVAL)
  }, [stopPolling])

  const generate = useCallback(async (request: GeneratePresentationRequest) => {
    reset()
    setState('submitting')
    setError(null)

    try {
      const res = await fetch('/api/presentation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || errData.detail || `HTTP ${res.status}`)
      }

      const data = await res.json()
      // Presenton API returns 'id', normalize to 'task_id'
      const resolvedTaskId = data.task_id || data.id
      setTaskId(resolvedTaskId)
      pollStatus(resolvedTaskId)
    } catch (err) {
      setState('failed')
      setError(err instanceof Error ? err.message : 'Generation failed')
    }
  }, [reset, pollStatus])

  const download = useCallback((title?: string) => {
    // Presenton API: file path is in data.path when status=completed
    const filePath = status?.data?.path || status?.result?.download_url || status?.result?.file_path
    if (!filePath) return
    let url = `/api/presentation/download?path=${encodeURIComponent(filePath)}`
    if (title) {
      url += `&title=${encodeURIComponent(title)}`
    }
    window.open(url, '_blank')
  }, [status])

  return {
    state,
    taskId,
    status,
    error,
    templates,
    templatesLoading,
    fetchTemplates,
    generate,
    download,
    reset,
  }
}
