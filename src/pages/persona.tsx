import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, RefreshCw, UserCircle } from 'lucide-react'
import { PendingPatterns, ApprovedPatterns } from '@/components/persona/PersonaPatterns'

interface PersonaStyle {
  formality: number
  verbosity: number
  tone_keywords: string[]
  ng_patterns: string[]
}

interface Persona {
  id: string
  display_name: string
  role: string
  build_status: 'pending' | 'building' | 'ready' | 'failed'
  style: PersonaStyle | null
  updated_at: string
}

interface PersonaPattern {
  id: string
  situation: string
  action: string
  confidence: number
  status: 'pending' | 'approved' | 'rejected'
  source_type: 'manual' | 'diff' | 'interview' | 'behavior'
  created_at: string
}

const BUILD_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: '未ビルド', className: 'bg-gray-100 text-gray-700' },
  building: { label: 'ビルド中', className: 'bg-amber-100 text-amber-700 animate-pulse' },
  ready: { label: '完了', className: 'bg-green-100 text-green-700' },
  failed: { label: '失敗', className: 'bg-red-100 text-red-700' },
}

export default function PersonaPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [persona, setPersona] = useState<Persona | null>(null)
  const [patterns, setPatterns] = useState<PersonaPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [building, setBuilding] = useState(false)

  const fetchPersona = useCallback(async () => {
    try {
      const res = await fetch('/api/personas?owner=me', { credentials: 'include' })
      if (!res.ok) {
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        throw new Error('取得に失敗しました')
      }
      const data = await res.json()
      const list = data.personas || data.items || (Array.isArray(data) ? data : [])
      if (list.length === 0) {
        setNotFound(true)
        return
      }
      setPersona(list[0])
      setNotFound(false)
    } catch {
      toast({ variant: 'destructive', title: 'エラー', description: 'ペルソナの取得に失敗しました' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchPatterns = useCallback(async (personaId: string) => {
    try {
      const res = await fetch(`/api/personas/${personaId}/patterns`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setPatterns(Array.isArray(data) ? data : data.patterns || data.items || [])
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchPersona()
    }
  }, [isAuthenticated, fetchPersona])

  useEffect(() => {
    if (persona) {
      fetchPatterns(persona.id)
    }
  }, [persona, fetchPatterns])

  // Poll while building
  useEffect(() => {
    if (!persona || persona.build_status !== 'building') return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/personas/${persona.id}`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setPersona(data)
          if (data.build_status !== 'building') {
            clearInterval(interval)
            setBuilding(false)
          }
        }
      } catch { /* ignore */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [persona?.build_status, persona?.id])

  const handleBuild = async () => {
    if (!persona) return
    setBuilding(true)
    try {
      const res = await fetch(`/api/personas/${persona.id}/build`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('ビルドの開始に失敗しました')
      setPersona({ ...persona, build_status: 'building' })
      toast({ title: 'プロフィル再構築を開始しました' })
    } catch {
      setBuilding(false)
      toast({ variant: 'destructive', title: 'エラー', description: 'ビルドの開始に失敗しました' })
    }
  }

  const handlePatternUpdated = () => {
    if (persona) fetchPatterns(persona.id)
  }

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </MainLayout>
    )
  }

  if (notFound) {
    return (
      <MainLayout title="マイペルソナ - Sales AI">
        <div className="max-w-2xl mx-auto mt-16">
          <Card>
            <CardContent className="py-12 text-center">
              <UserCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-900 mb-2">ペルソナが未作成です</h2>
              <p className="text-gray-500">管理者に作成を依頼してください。</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (!persona) return null

  const badge = BUILD_STATUS[persona.build_status] || BUILD_STATUS.pending

  return (
    <MainLayout title="マイペルソナ - Sales AI">
      <div className="space-y-6 max-w-4xl">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-gray-400" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{persona.display_name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{persona.role}</p>
            </div>
          </div>
          <Button
            onClick={handleBuild}
            disabled={building || persona.build_status === 'building'}
            variant="outline"
          >
            {building || persona.build_status === 'building' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                構築中...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                プロフィル再構築
              </>
            )}
          </Button>
        </div>

        {/* Style Summary */}
        {persona.style && <StyleSummary style={persona.style} />}

        {/* Pending Patterns */}
        <PendingPatterns
          personaId={persona.id}
          patterns={patterns}
          onPatternUpdated={handlePatternUpdated}
        />

        {/* Approved Patterns */}
        <ApprovedPatterns patterns={patterns} />
      </div>
    </MainLayout>
  )
}

function StyleSummary({ style }: { style: PersonaStyle }) {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium">スタイル</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-4">
        {/* Formality */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>カジュアル</span>
            <span>フォーマル</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(style.formality ?? 0.5) * 100}%` }}
            />
          </div>
        </div>

        {/* Verbosity */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>簡潔</span>
            <span>詳細</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(style.verbosity ?? 0.5) * 100}%` }}
            />
          </div>
        </div>

        {/* Tone Keywords */}
        {style.tone_keywords && style.tone_keywords.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5">トーンキーワード</p>
            <div className="flex flex-wrap gap-1.5">
              {style.tone_keywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* NG Patterns */}
        {style.ng_patterns && style.ng_patterns.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5">NGパターン</p>
            <div className="flex flex-wrap gap-1.5">
              {style.ng_patterns.map((ng, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                >
                  {ng}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
