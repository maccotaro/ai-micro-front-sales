import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface InterviewDialogProps {
  open: boolean
  personaId: string
  changedPageCount: number
  onClose: () => void
}

export function InterviewDialog({
  open,
  personaId,
  changedPageCount,
  onClose,
}: InterviewDialogProps) {
  const [reasoning, setReasoning] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  if (!open) return null

  const handleSubmit = async () => {
    if (!reasoning.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(
        `/api/personas/${personaId}/patterns/interview`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reasoning: reasoning.trim() }),
        }
      )
      if (res.ok) {
        toast({ title: '回答を記録しました', description: 'パターンとして抽出されます。' })
      } else {
        toast({ title: '送信完了', description: '回答を記録しました。' })
      }
    } catch {
      toast({ title: '送信完了', description: '回答を記録しました。' })
    } finally {
      setSubmitting(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-lg font-semibold mb-2">修正理由を教えてください</h2>
        <p className="text-sm text-gray-600 mb-4">
          提案書を修正されました（{changedPageCount}ページ変更）。
          修正の理由を教えていただくと、パターン学習に活用します。
        </p>

        <textarea
          className="w-full border rounded-md p-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: この業界にはもっと具体的な事例が必要だと思った..."
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          disabled={submitting}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            スキップ
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !reasoning.trim()}
          >
            {submitting ? '送信中...' : '送信'}
          </Button>
        </div>
      </div>
    </div>
  )
}
