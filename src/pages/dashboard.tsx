import Link from 'next/link'
import { MainLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Lightbulb, Calculator, Search, Network, Plus } from 'lucide-react'

const features = [
  {
    title: '議事録管理',
    description: '商談議事録を作成・管理し、AIで解析します',
    icon: FileText,
    href: '/meetings',
    action: '議事録一覧',
  },
  {
    title: '提案書生成',
    description: '解析結果に基づいて最適な提案を自動生成',
    icon: Lightbulb,
    href: '/proposals',
    action: '提案書一覧',
  },
  {
    title: 'シミュレーション',
    description: 'コスト試算とROI計算を実行',
    icon: Calculator,
    href: '/simulation',
    action: 'シミュレーション',
  },
  {
    title: '類似案件検索',
    description: '過去の類似案件や成功事例を検索',
    icon: Search,
    href: '/search',
    action: '検索',
  },
  {
    title: 'グラフベース推薦',
    description: 'ナレッジグラフによる関連情報の推薦',
    icon: Network,
    href: '/graph',
    action: '推薦を見る',
  },
]

export default function DashboardPage() {
  return (
    <MainLayout title="ダッシュボード - Sales AI">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="mt-1 text-sm text-gray-500">
              営業支援AIサービスへようこそ
            </p>
          </div>
          <Link href="/meetings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規議事録作成
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={feature.href}>
                  <Button variant="outline" className="w-full">
                    {feature.action}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>クイックスタート</CardTitle>
            <CardDescription>
              営業活動の効率化を始めましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>商談議事録を作成します（会社名、日付、内容を入力）</li>
              <li>AIが議事録を解析し、顧客の課題・ニーズを抽出します</li>
              <li>解析結果に基づいて、最適な商品提案が自動生成されます</li>
              <li>シミュレーション機能でコスト試算を行います</li>
              <li>類似の成功事例を参考に、効果的な営業活動を行います</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
