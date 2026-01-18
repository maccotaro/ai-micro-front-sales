import { useState } from 'react'
import useSWR from 'swr'
import { MainLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Network,
  Search,
  Package,
  FileText,
  Trophy,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { graphApi, fetcher } from '@/lib/api'
import { GraphRecommendation } from '@/types'

export default function GraphPage() {
  const { toast } = useToast()
  const [meetingId, setMeetingId] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [recommendations, setRecommendations] = useState<GraphRecommendation | null>(null)

  const { data: health } = useSWR<{ status: string }>('/api/sales/graph/health', fetcher)
  const { data: stats } = useSWR<{ stats: Record<string, number | undefined> }>('/api/sales/graph/stats', fetcher)

  const handleSearch = async () => {
    if (!meetingId.trim()) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: '議事録IDを入力してください',
      })
      return
    }

    setIsSearching(true)
    setRecommendations(null)

    try {
      const data = await graphApi.recommendations(meetingId)
      setRecommendations(data)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '推薦の取得に失敗しました',
      })
    } finally {
      setIsSearching(false)
    }
  }

  const isConnected = health?.status === 'connected'

  return (
    <MainLayout title="グラフベース推薦 - Sales AI">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">グラフベース推薦</h1>
          <p className="mt-1 text-sm text-gray-500">
            ナレッジグラフによる関連情報の推薦を取得します
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="text-xs text-gray-500">Neo4j接続</p>
                  <p className="font-medium">
                    {isConnected ? '接続中' : '未接続'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {stats?.stats && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">チャンク</p>
                      <p className="font-medium">{stats.stats.Chunk || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-xs text-gray-500">問題ノード</p>
                      <p className="font-medium">{stats.stats.Problem || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Network className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500">製品ノード</p>
                      <p className="font-medium">{stats.stats.Product || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>推薦を取得</CardTitle>
            <CardDescription>
              議事録IDを入力して関連する推薦を取得します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meeting_id">議事録ID</Label>
              <div className="flex space-x-2">
                <Input
                  id="meeting_id"
                  placeholder="議事録IDを入力..."
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching || !isConnected}>
                  <Search className="mr-2 h-4 w-4" />
                  {isSearching ? '検索中...' : '取得'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {recommendations && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  推奨商品
                </CardTitle>
                <CardDescription>
                  課題に基づく商品推薦
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.products?.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.products.map((product, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{product.product_name}</h4>
                          <Badge variant="outline">
                            関連度: {Math.round(product.relevance_score * 100)}%
                          </Badge>
                        </div>
                        {product.matched_problems?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {product.matched_problems.map((problem, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {problem}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">推奨商品がありません</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  類似議事録
                </CardTitle>
                <CardDescription>
                  同様の課題・ニーズを持つ議事録
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.similar_meetings?.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.similar_meetings.map((meeting, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{meeting.company_name}</h4>
                          <Badge variant="outline">
                            類似度: {Math.round(meeting.similarity_score * 100)}%
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          {meeting.shared_problems?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-gray-500">共通課題:</span>
                              {meeting.shared_problems.map((problem, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {problem}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {meeting.shared_needs?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-gray-500">共通ニーズ:</span>
                              {meeting.shared_needs.map((need, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {need}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">類似議事録がありません</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  関連成功事例
                </CardTitle>
                <CardDescription>
                  参考になる成功事例
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.success_cases?.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.success_cases.map((case_, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg"
                      >
                        <h4 className="font-medium">{case_.title}</h4>
                        <p className="mt-1 text-sm text-gray-600">
                          {case_.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {case_.industry && (
                            <Badge variant="outline">{case_.industry}</Badge>
                          )}
                          {case_.area && (
                            <Badge variant="outline">{case_.area}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">関連成功事例がありません</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
