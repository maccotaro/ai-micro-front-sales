import { useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { TemplateSelector } from './TemplateSelector'
import { PresentationSettings } from './PresentationSettings'
import { PresentationProgress } from './PresentationProgress'
import { usePresentationGenerate } from '@/hooks/usePresentationGenerate'
import {
  defaultPresentationSettings,
  type GeneratePresentationRequest,
} from '@/lib/presentation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PresentationWizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialContent: string
  downloadTitle?: string
  pipelineRunId?: string
}

const STEPS = [
  { title: 'コンテンツ確認', description: '生成に使用するマークダウンを確認・編集' },
  { title: 'テンプレート選択', description: 'プレゼンテーションのテンプレートを選択' },
  { title: '詳細設定', description: 'スライド枚数やトーンなどを設定' },
  { title: '生成', description: 'プレゼンテーションを生成してダウンロード' },
]

export function PresentationWizardDialog({
  open,
  onOpenChange,
  initialContent,
  downloadTitle,
  pipelineRunId,
}: PresentationWizardDialogProps) {
  const [step, setStep] = useState(0)
  const [content, setContent] = useState('')
  const [settings, setSettings] = useState<Omit<GeneratePresentationRequest, 'content'>>(
    { ...defaultPresentationSettings }
  )

  const handlePresentationCompleted = useCallback(
    async (filePath: string, format: string) => {
      if (!pipelineRunId) return
      try {
        await fetch(`/api/sales/proposal-pipeline/runs/${pipelineRunId}/presentation`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            presentation_path: filePath,
            presentation_format: format,
          }),
        })
      } catch {
        // Non-critical: linking failure should not block the user
        console.error('Failed to link presentation to pipeline run')
      }
    },
    [pipelineRunId],
  )

  const {
    state,
    status,
    error,
    templates,
    templatesLoading,
    fetchTemplates,
    generate,
    download,
    reset,
  } = usePresentationGenerate({ onCompleted: handlePresentationCompleted })

  // Sync content from prop whenever dialog opens
  useEffect(() => {
    if (open) {
      setStep(0)
      setContent(initialContent)
      setSettings({ ...defaultPresentationSettings })
      reset()
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenChange = useCallback((isOpen: boolean) => {
    onOpenChange(isOpen)
  }, [onOpenChange])

  const handleGenerate = useCallback(() => {
    generate({ content, ...settings })
  }, [content, settings, generate])

  const handleRetry = useCallback(() => {
    reset()
    setStep(2)
  }, [reset])

  const canGoNext = step < 3
  const canGoBack = step > 0 && state === 'idle'

  const handleNext = () => {
    if (step === 2) {
      setStep(3)
      handleGenerate()
    } else if (canGoNext) {
      setStep(step + 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{STEPS[step].title}</DialogTitle>
          <DialogDescription>{STEPS[step].description}</DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-1 mb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  i === step
                    ? 'bg-primary text-white'
                    : i < step
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    i < step ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
          {step === 0 && (
            <div className="space-y-2">
              <Label htmlFor="md-content">マークダウンコンテンツ</Label>
              <Textarea
                id="md-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="font-mono text-sm"
                placeholder="プレゼンに変換するマークダウンを入力..."
              />
            </div>
          )}

          {step === 1 && (
            <TemplateSelector
              templates={templates}
              loading={templatesLoading}
              selected={settings.template || 'general'}
              onSelect={(name) =>
                setSettings({ ...settings, template: name as GeneratePresentationRequest['template'] })
              }
              onFetchTemplates={fetchTemplates}
            />
          )}

          {step === 2 && (
            <PresentationSettings
              settings={settings}
              onChange={setSettings}
            />
          )}

          {step === 3 && (
            <PresentationProgress
              state={state}
              status={status}
              error={error}
              onDownload={() => download(downloadTitle)}
              onRetry={handleRetry}
            />
          )}
        </div>

        {/* Navigation */}
        {step < 3 && (
          <div className="flex justify-between pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={!canGoBack}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              戻る
            </Button>
            <Button
              onClick={handleNext}
              disabled={step === 0 && !content.trim()}
            >
              {step === 2 ? '生成開始' : '次へ'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
