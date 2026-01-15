import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'
import { MainLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Brain,
  Lightbulb,
  Trash2,
  Calendar,
  Building2,
  Users,
  AlertCircle,
  Target,
  Tag,
  MapPin,
  Briefcase,
  MessageSquare,
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { MeetingMinute } from '@/types'
import { meetingMinutesApi, proposalsApi, fetcher } from '@/lib/api'
import { ChatTab } from '@/components/chat/ChatTab'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' }> = {
  draft: { label: '下書き', variant: 'secondary' },
  analyzed: { label: '解析済み', variant: 'default' },
  proposed: { label: '提案済み', variant: 'success' },
  closed: { label: '完了', variant: 'warning' },
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
}

export default function MeetingDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { toast } = useToast()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: meeting, error, mutate } = useSWR<MeetingMinute>(
    id ? `/api/sales/meeting-minutes/${id}` : null,
    fetcher
  )

  const handleAnalyze = async () => {
    if (!id) return
    setIsAnalyzing(true)
    try {
      await meetingMinutesApi.analyze(id as string)
      await mutate()
      toast({
        title: '解析完了',
        description: '議事録の解析が完了しました',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '解析に失敗しました',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateProposal = async () => {
    if (!id) return
    setIsGenerating(true)
    try {
      const proposal = await proposalsApi.generate(id as string)
      await mutate()
      toast({
        title: '提案生成完了',
        description: '提案書が生成されました',
      })
      router.push(`/proposals/${proposal.id}`)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '提案生成に失敗しました',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('この議事録を削除しますか？')) return
    setIsDeleting(true)
    try {
      await meetingMinutesApi.delete(id as string)
      toast({
        title: '削除完了',
        description: '議事録を削除しました',
      })
      router.push('/meetings')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '削除に失敗しました',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Helper to get attendee names
  const getAttendeeNames = () => {
    if (!meeting?.attendees || meeting.attendees.length === 0) return ''
    return meeting.attendees.map(a => a.name).join(', ')
  }

  if (error) {
    return (
      <MainLayout title="エラー - Sales AI">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">データの取得に失敗しました</p>
            <Link href="/meetings">
              <Button className="mt-4">議事録一覧に戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </MainLayout>
    )
  }

  if (!meeting) {
    return (
      <MainLayout title="読み込み中... - Sales AI">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    )
  }

  // Use parsed_json for analysis results
  const analysisResult = meeting.parsed_json

  return (
    <MainLayout title={`${meeting.company_name} - Sales AI`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/meetings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">{meeting.company_name}</h1>
                <Badge variant={statusLabels[meeting.status]?.variant}>
                  {statusLabels[meeting.status]?.label}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                作成日: {formatDateTime(meeting.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link href={`/meetings/${id}/edit`}>
              <Button variant="outline">
                編集
              </Button>
            </Link>
            {meeting.status !== 'closed' && (
              <Button onClick={handleAnalyze} disabled={isAnalyzing} variant={meeting.status !== 'draft' ? 'outline' : 'default'}>
                <Brain className="mr-2 h-4 w-4" />
                {isAnalyzing ? '解析中...' : meeting.status === 'draft' ? 'AI解析' : '再解析'}
              </Button>
            )}
            {meeting.parsed_json && meeting.status !== 'closed' && (
              <Button onClick={handleGenerateProposal} disabled={isGenerating}>
                <Lightbulb className="mr-2 h-4 w-4" />
                {isGenerating ? '生成中...' : meeting.status === 'proposed' ? '再提案' : '提案生成'}
              </Button>
            )}
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">会社名</p>
                  <p className="font-medium">{meeting.company_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">商談日</p>
                  <p className="font-medium">{meeting.meeting_date ? formatDate(meeting.meeting_date) : '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">業種</p>
                  <p className="font-medium">{meeting.industry || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">地域</p>
                  <p className="font-medium">{meeting.area || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">参加者</p>
                  <p className="font-medium">
                    {meeting.attendees?.length || 0}名
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">議事録内容</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!analysisResult}>
              解析結果
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="mr-1 h-4 w-4" />
              AIチャット
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>議事録内容</CardTitle>
                {meeting.attendees && meeting.attendees.length > 0 && (
                  <CardDescription>
                    参加者: {getAttendeeNames()}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-gray-700">
                  {meeting.raw_text}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            {analysisResult && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      抽出された課題
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisResult.issues?.length > 0 ? (
                      <div className="space-y-3">
                        {analysisResult.issues.map((issue, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                          >
                            {issue.priority && (
                              <Badge className={priorityColors[issue.priority]}>
                                {issue.priority === 'high' ? '高' : issue.priority === 'medium' ? '中' : '低'}
                              </Badge>
                            )}
                            <div>
                              <p className="font-medium">{issue.issue}</p>
                              {issue.category && (
                                <p className="text-xs text-gray-500">カテゴリ: {issue.category}</p>
                              )}
                              {issue.details && (
                                <p className="text-sm text-gray-600 mt-1">{issue.details}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">課題が抽出されませんでした</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="mr-2 h-5 w-5" />
                      抽出されたニーズ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisResult.needs?.length > 0 ? (
                      <div className="space-y-3">
                        {analysisResult.needs.map((need, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            {need.urgency && (
                              <Badge className={priorityColors[need.urgency]}>
                                {need.urgency === 'high' ? '高' : need.urgency === 'medium' ? '中' : '低'}
                              </Badge>
                            )}
                            <div>
                              <p className="font-medium">{need.need}</p>
                              {need.budget_hint && (
                                <p className="text-sm text-gray-600">予算: {need.budget_hint}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">ニーズが抽出されませんでした</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>要約</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{analysisResult.summary}</p>
                    {analysisResult.confidence_score !== undefined && (
                      <p className="text-sm text-gray-500 mt-2">
                        信頼度: {Math.round(analysisResult.confidence_score * 100)}%
                      </p>
                    )}
                  </CardContent>
                </Card>

                {analysisResult.next_actions && analysisResult.next_actions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>次のアクション</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisResult.next_actions.map((action, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {analysisResult.keywords && analysisResult.keywords.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Tag className="mr-2 h-5 w-5" />
                        キーワード
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardContent className="p-0">
                <ChatTab
                  meetingMinuteId={id as string}
                  companyName={meeting.company_name}
                  isAnalyzed={meeting.status !== 'draft' && !!analysisResult}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
