import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface PersonaPattern {
  id: string
  situation: string
  action: string
  confidence: number
  status: 'pending' | 'approved' | 'rejected'
  source_type: 'manual' | 'diff' | 'interview' | 'behavior'
  created_at: string
}

const SOURCE_TYPE_STYLES: Record<string, { label: string; className: string }> = {
  manual: { label: '手動', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  diff: { label: '差分', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  interview: { label: 'インタビュー', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  behavior: { label: '行動', className: 'bg-orange-100 text-orange-700 border-orange-200' },
}

interface PendingPatternsProps {
  personaId: string
  patterns: PersonaPattern[]
  onPatternUpdated: () => void
}

export function PendingPatterns({ personaId, patterns, onPatternUpdated }: PendingPatternsProps) {
  const { toast } = useToast()
  const [updating, setUpdating] = useState<string | null>(null)

  const pendingPatterns = patterns.filter((p) => p.status === 'pending')

  const updateStatus = async (patternId: string, status: 'approved' | 'rejected') => {
    setUpdating(patternId)
    try {
      const res = await fetch(`/api/personas/${personaId}/patterns/${patternId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('更新に失敗しました')
      toast({
        title: status === 'approved' ? '承認しました' : '却下しました',
      })
      onPatternUpdated()
    } catch {
      toast({ variant: 'destructive', title: 'エラー', description: 'パターンの更新に失敗しました' })
    } finally {
      setUpdating(null)
    }
  }

  if (pendingPatterns.length === 0) {
    return (
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium">保留中のパターン</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-sm text-gray-500">保留中のパターンはありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium">
          保留中のパターン ({pendingPatterns.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        {pendingPatterns.map((pattern) => (
          <div
            key={pattern.id}
            className="border border-gray-200 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-gray-900">{pattern.situation}</p>
                <p className="text-sm text-gray-600">{pattern.action}</p>
              </div>
              <SourceTypeBadge sourceType={pattern.source_type} />
            </div>
            <div className="flex items-center justify-between">
              <ConfidenceBar confidence={pattern.confidence} />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-green-600 hover:text-green-800 hover:bg-green-50"
                  onClick={() => updateStatus(pattern.id, 'approved')}
                  disabled={updating === pattern.id}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  承認
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-red-600 hover:text-red-800 hover:bg-red-50"
                  onClick={() => updateStatus(pattern.id, 'rejected')}
                  disabled={updating === pattern.id}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  却下
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface ApprovedPatternsProps {
  patterns: PersonaPattern[]
}

export function ApprovedPatterns({ patterns }: ApprovedPatternsProps) {
  const approvedPatterns = patterns.filter((p) => p.status === 'approved')

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium">
          承認済みパターン ({approvedPatterns.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        {approvedPatterns.length === 0 ? (
          <p className="text-sm text-gray-500">承認済みのパターンはありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">状況</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">対応</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500 w-28">確信度</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500 w-24">ソース</th>
                  <th className="text-left py-2 font-medium text-gray-500 w-24">作成日</th>
                </tr>
              </thead>
              <tbody>
                {approvedPatterns.map((pattern) => (
                  <tr key={pattern.id} className="border-b border-gray-100">
                    <td className="py-2 pr-3 text-gray-900">{pattern.situation}</td>
                    <td className="py-2 pr-3 text-gray-600">{pattern.action}</td>
                    <td className="py-2 pr-3">
                      <ConfidenceBar confidence={pattern.confidence} />
                    </td>
                    <td className="py-2 pr-3">
                      <SourceTypeBadge sourceType={pattern.source_type} />
                    </td>
                    <td className="py-2 text-gray-500 text-xs">
                      {new Date(pattern.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  return (
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full"
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">
        {(confidence * 100).toFixed(0)}%
      </span>
    </div>
  )
}

function SourceTypeBadge({ sourceType }: { sourceType: string }) {
  const style = SOURCE_TYPE_STYLES[sourceType] || {
    label: sourceType,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style.className}`}>
      {style.label}
    </span>
  )
}
