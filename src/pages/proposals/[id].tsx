import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'
import { MainLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Package,
  MessageSquare,
  Shield,
  FileText,
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { Proposal } from '@/types'
import { proposalsApi, fetcher } from '@/lib/api'

export default function ProposalDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { toast } = useToast()
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: proposal, error, mutate } = useSWR<Proposal>(
    id ? `/api/sales/proposals/${id}` : null,
    fetcher
  )

  const handleFeedback = async (action: 'accept' | 'reject') => {
    if (!id) return
    setIsSubmitting(true)
    try {
      await proposalsApi.updateFeedback(id as string, {
        feedback: action === 'accept' ? 'accepted' : 'rejected',
        feedback_comment: feedback || undefined,
      })
      await mutate()
      toast({
        title: '更新完了',
        description: 'フィードバックを送信しました',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '更新に失敗しました',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('この提案書を削除しますか？')) return
    setIsDeleting(true)
    try {
      await proposalsApi.delete(id as string)
      toast({
        title: '削除完了',
        description: '提案書を削除しました',
      })
      router.push('/proposals')
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

  if (error) {
    return (
      <MainLayout title="エラー - Sales AI">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">データの取得に失敗しました</p>
            <Link href="/proposals">
              <Button className="mt-4">提案書一覧に戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </MainLayout>
    )
  }

  if (!proposal) {
    return (
      <MainLayout title="読み込み中... - Sales AI">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    )
  }

  const proposalJson = proposal.proposal_json
  const products = proposalJson?.recommended_products ?? []
  const talkingPoints = proposalJson?.talking_points ?? []
  const objectionHandlers = proposalJson?.objection_handlers ?? {}

  return (
    <MainLayout title={`${proposalJson?.title || '提案書詳細'} - Sales AI`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/proposals">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {proposalJson?.title || `提案書 #${proposal.id.slice(0, 8)}`}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                作成日: {formatDateTime(proposal.created_at)}
              </p>
            </div>
          </div>

          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              概要
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {proposalJson?.summary || '提案書の概要がありません'}
            </p>
          </CardContent>
        </Card>

        {/* Recommended Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              推奨商品
            </CardTitle>
            <CardDescription>AIが提案する最適な商品</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{product.product_name}</h4>
                        {product.category && (
                          <span className="text-sm text-gray-500">{product.category}</span>
                        )}
                      </div>
                      <Badge variant="outline">
                        マッチ度: {Math.round(product.match_score * 100)}%
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{product.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">推奨商品がありません</p>
            )}
          </CardContent>
        </Card>

        {/* Talking Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              トークポイント
            </CardTitle>
            <CardDescription>商談で使用するトークポイント</CardDescription>
          </CardHeader>
          <CardContent>
            {talkingPoints.length > 0 ? (
              <ul className="space-y-2">
                {talkingPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary text-white rounded-full text-sm">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">トークポイントがありません</p>
            )}
          </CardContent>
        </Card>

        {/* Objection Handlers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              反論対応
            </CardTitle>
            <CardDescription>想定される反論と対応策</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(objectionHandlers).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(objectionHandlers).map(([objection, response], index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-red-600">
                      反論: {objection}
                    </p>
                    <p className="mt-2 text-gray-700">
                      対応: {response}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">反論対応がありません</p>
            )}
          </CardContent>
        </Card>

        {/* Feedback Section */}
        {!proposal.feedback && (
          <Card>
            <CardHeader>
              <CardTitle>フィードバック</CardTitle>
              <CardDescription>この提案に対するフィードバックを送信</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">コメント（任意）</Label>
                <Textarea
                  id="feedback"
                  placeholder="フィードバックを入力..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handleFeedback('accept')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  採用
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleFeedback('reject')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  却下
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show existing feedback */}
        {proposal.feedback && (
          <Card>
            <CardHeader>
              <CardTitle>フィードバック</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={proposal.feedback === 'accepted' ? 'success' : 'destructive'}>
                {proposal.feedback === 'accepted' ? '採用済み' : '却下済み'}
              </Badge>
              {proposal.feedback_comment && (
                <p className="mt-2 text-gray-700">{proposal.feedback_comment}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
