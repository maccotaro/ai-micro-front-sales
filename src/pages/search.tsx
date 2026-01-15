import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Search, FileText, Trophy, MessageSquare, Package } from 'lucide-react'
import { searchApi } from '@/lib/api'

interface SearchResultItem {
  id?: string
  meeting_id?: string
  title?: string
  name?: string
  company_name?: string
  description?: string
  content?: string
  content_preview?: string
  matched_content?: string
  score?: number
  similarity?: number
  industry?: string
  area?: string
  category?: string
  status?: string
}

export default function SearchPage() {
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [activeTab, setActiveTab] = useState('meetings')

  const [filters, setFilters] = useState({
    industry: '',
    area: '',
    category: '',
    issue_type: '',
    limit: 10,
    threshold: 0.3,
  })

  const handleSearch = async () => {
    console.log('handleSearch called, query:', query, 'activeTab:', activeTab)
    if (!query.trim()) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: '検索クエリを入力してください',
      })
      return
    }

    setIsSearching(true)
    setResults([])

    try {
      let data
      console.log('Fetching data for tab:', activeTab)
      switch (activeTab) {
        case 'meetings':
          data = await searchApi.meetings({
            query,
            limit: filters.limit,
            threshold: filters.threshold,
          })
          console.log('Meetings API response:', data)
          break
        case 'success-cases':
          data = await searchApi.successCases({
            query,
            industry: filters.industry || undefined,
            area: filters.area || undefined,
            limit: filters.limit,
            threshold: filters.threshold,
          })
          break
        case 'sales-talks':
          data = await searchApi.salesTalks({
            query,
            issue_type: filters.issue_type || undefined,
            industry: filters.industry || undefined,
            limit: filters.limit,
            threshold: filters.threshold,
          })
          break
        case 'products':
          data = await searchApi.products({
            query,
            category: filters.category || undefined,
            limit: filters.limit,
            threshold: filters.threshold,
          })
          break
        default:
          return
      }

      // Handle both array response and object with items/results property
      let items: SearchResultItem[] = []
      if (Array.isArray(data)) {
        items = data
      } else if (data && typeof data === 'object') {
        const responseData = data as Record<string, unknown>
        if (Array.isArray(responseData.results)) {
          items = responseData.results as SearchResultItem[]
        } else if (Array.isArray(responseData.items)) {
          items = responseData.items as SearchResultItem[]
        }
      }
      console.log('Search results:', items)
      setResults(items)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '検索に失敗しました',
      })
    } finally {
      setIsSearching(false)
    }
  }

  const getIcon = () => {
    switch (activeTab) {
      case 'meetings':
        return <FileText className="h-4 w-4" />
      case 'success-cases':
        return <Trophy className="h-4 w-4" />
      case 'sales-talks':
        return <MessageSquare className="h-4 w-4" />
      case 'products':
        return <Package className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  return (
    <MainLayout title="類似検索 - Sales AI">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">類似検索</h1>
          <p className="mt-1 text-sm text-gray-500">
            過去の類似案件や成功事例を検索します
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>検索条件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">検索クエリ</Label>
              <div className="flex space-x-2">
                <Input
                  id="query"
                  placeholder="検索したい内容を入力..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  <Search className="mr-2 h-4 w-4" />
                  {isSearching ? '検索中...' : '検索'}
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="meetings">議事録</TabsTrigger>
                <TabsTrigger value="success-cases">成功事例</TabsTrigger>
                <TabsTrigger value="sales-talks">トーク</TabsTrigger>
                <TabsTrigger value="products">商品</TabsTrigger>
              </TabsList>

              <TabsContent value="meetings" className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="threshold">類似度閾値</Label>
                    <Input
                      id="threshold"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={filters.threshold}
                      onChange={(e) =>
                        setFilters({ ...filters, threshold: parseFloat(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit">最大件数</Label>
                    <Input
                      id="limit"
                      type="number"
                      min="1"
                      max="50"
                      value={filters.limit}
                      onChange={(e) =>
                        setFilters({ ...filters, limit: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="success-cases" className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="industry">業種</Label>
                    <Input
                      id="industry"
                      placeholder="例: IT"
                      value={filters.industry}
                      onChange={(e) =>
                        setFilters({ ...filters, industry: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">地域</Label>
                    <Input
                      id="area"
                      placeholder="例: 東京"
                      value={filters.area}
                      onChange={(e) =>
                        setFilters({ ...filters, area: e.target.value })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sales-talks" className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="issue_type">課題タイプ</Label>
                    <Input
                      id="issue_type"
                      placeholder="例: コスト削減"
                      value={filters.issue_type}
                      onChange={(e) =>
                        setFilters({ ...filters, issue_type: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry2">業種</Label>
                    <Input
                      id="industry2"
                      placeholder="例: 製造業"
                      value={filters.industry}
                      onChange={(e) =>
                        setFilters({ ...filters, industry: e.target.value })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="products" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリ</Label>
                  <Input
                    id="category"
                    placeholder="例: SaaS"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getIcon()}
                <span className="ml-2">検索結果 ({results.length}件)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((item, index) => {
                  const itemId = item.id || item.meeting_id || String(index)
                  const itemTitle = item.title || item.name || item.company_name || `結果 ${index + 1}`
                  const itemContent = item.description || item.content || item.content_preview || item.matched_content
                  const itemScore = item.score ?? item.similarity ?? 0

                  return (
                    <div
                      key={itemId}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{itemTitle}</h4>
                          {itemContent && (
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              {itemContent}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.industry && (
                              <Badge variant="outline">{item.industry}</Badge>
                            )}
                            {item.area && (
                              <Badge variant="outline">{item.area}</Badge>
                            )}
                            {item.category && (
                              <Badge variant="outline">{item.category}</Badge>
                            )}
                            {item.status && (
                              <Badge variant="outline">{item.status}</Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {Math.round(itemScore * 100)}%
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {results.length === 0 && !isSearching && query && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                結果が見つかりません
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                検索条件を変更してお試しください
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
