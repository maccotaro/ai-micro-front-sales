import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Calculator, TrendingUp, DollarSign, Percent, Package } from 'lucide-react'
import { simulationApi } from '@/lib/api'
import { SimulationResult, QuickEstimateResponse } from '@/types'

type ResultType =
  | { type: 'simulation'; data: SimulationResult }
  | { type: 'quickEstimate'; data: QuickEstimateResponse }
  | null

export default function SimulationPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ResultType>(null)

  const [formData, setFormData] = useState({
    area: '',
    industry: '',
    product_ids: '',
    employee_count: '',
    current_cost: '',
    target_reduction_rate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)

    try {
      const data = {
        area: formData.area,
        industry: formData.industry,
        product_ids: formData.product_ids
          ? formData.product_ids.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
        employee_count: formData.employee_count
          ? parseInt(formData.employee_count, 10)
          : undefined,
        current_cost: formData.current_cost
          ? parseFloat(formData.current_cost)
          : undefined,
        target_reduction_rate: formData.target_reduction_rate
          ? parseFloat(formData.target_reduction_rate)
          : undefined,
      }

      const simResult = await simulationApi.simulate(data)
      setResult({ type: 'simulation', data: simResult })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : 'シミュレーションに失敗しました',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickEstimate = async () => {
    setIsLoading(true)

    try {
      const data = {
        area: formData.area,
        industry: formData.industry,
      }

      const quickResult = await simulationApi.quickEstimate(data)
      setResult({ type: 'quickEstimate', data: quickResult })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '見積りに失敗しました',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderSimulationResult = (data: SimulationResult) => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-600">
            <DollarSign className="h-5 w-5" />
            <span className="text-sm font-medium">概算コスト</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-900">
            ¥{parseInt(data.total_estimated_cost || '0').toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">最終コスト</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-900">
            ¥{parseInt(data.final_cost || '0').toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2 text-purple-600">
            <Percent className="h-5 w-5" />
            <span className="text-sm font-medium">ROI予測</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-900">
            {data.total_roi != null ? `${data.total_roi.toFixed(1)}%` : '-'}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calculator className="h-5 w-5" />
            <span className="text-sm font-medium">信頼度</span>
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {data.confidence_level === 'high' ? '高' : data.confidence_level === 'medium' ? '中' : '低'}
          </p>
        </div>
      </div>

      {data.product_simulations && data.product_simulations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">商品別コスト</h4>
          <div className="space-y-2">
            {data.product_simulations.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-600">
                  {item.product_name}
                </span>
                <span className="font-medium">
                  ¥{item.adjusted_cost?.toLocaleString() || '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.applicable_campaigns && data.applicable_campaigns.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">適用キャンペーン</h4>
          <div className="space-y-2">
            {data.applicable_campaigns.map((campaign, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg"
              >
                <span className="text-sm text-yellow-800">
                  {campaign.campaign_name}
                </span>
                <span className="font-medium text-yellow-900">
                  -{campaign.discount_rate * 100}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.assumptions && data.assumptions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">試算の前提条件</h4>
          <ul className="space-y-1">
            {data.assumptions.map((assumption, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                <span className="text-gray-400">•</span>
                <span>{assumption}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderQuickEstimateResult = (data: QuickEstimateResponse) => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-600">
            <DollarSign className="h-5 w-5" />
            <span className="text-sm font-medium">最低見積</span>
          </div>
          <p className="mt-2 text-xl font-bold text-blue-900">
            ¥{parseInt(data.min_estimate || '0').toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">標準見積</span>
          </div>
          <p className="mt-2 text-xl font-bold text-green-900">
            ¥{parseInt(data.typical_estimate || '0').toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2 text-purple-600">
            <DollarSign className="h-5 w-5" />
            <span className="text-sm font-medium">最高見積</span>
          </div>
          <p className="mt-2 text-xl font-bold text-purple-900">
            ¥{parseInt(data.max_estimate || '0').toLocaleString()}
          </p>
        </div>
      </div>

      {data.area_wage_avg && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calculator className="h-5 w-5" />
            <span className="text-sm font-medium">地域平均時給</span>
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">
            ¥{parseInt(data.area_wage_avg).toLocaleString()}
          </p>
        </div>
      )}

      {data.recommended_products && data.recommended_products.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">推奨商品</h4>
          <div className="space-y-2">
            {data.recommended_products.map((product, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {product.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {product.category}
                    </span>
                  </div>
                </div>
                <span className="font-medium text-gray-900">
                  ¥{product.base_price?.toLocaleString() || '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.industry_benchmark && (
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">業界ベンチマーク</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <span className="text-sm text-yellow-700">従業員1人当たり支出</span>
              <p className="font-medium text-yellow-900">
                ¥{data.industry_benchmark.typical_spend_per_employee?.toLocaleString() || '-'}
              </p>
            </div>
            <div>
              <span className="text-sm text-yellow-700">時給指数</span>
              <p className="font-medium text-yellow-900">
                {data.industry_benchmark.wage_index?.toFixed(2) || '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <MainLayout title="シミュレーション - Sales AI">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">シミュレーション</h1>
          <p className="mt-1 text-sm text-gray-500">
            コスト試算とROI計算を行います
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>パラメータ入力</CardTitle>
              <CardDescription>シミュレーション条件を設定</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="area">地域</Label>
                    <Input
                      id="area"
                      placeholder="例: 東京"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">業種</Label>
                    <Input
                      id="industry"
                      placeholder="例: IT"
                      value={formData.industry}
                      onChange={(e) =>
                        setFormData({ ...formData, industry: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_ids">商品ID（カンマ区切り）</Label>
                  <Input
                    id="product_ids"
                    placeholder="例: uuid-001, uuid-002"
                    value={formData.product_ids}
                    onChange={(e) =>
                      setFormData({ ...formData, product_ids: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="employee_count">従業員数</Label>
                    <Input
                      id="employee_count"
                      type="number"
                      placeholder="例: 100"
                      value={formData.employee_count}
                      onChange={(e) =>
                        setFormData({ ...formData, employee_count: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current_cost">現在のコスト（円）</Label>
                    <Input
                      id="current_cost"
                      type="number"
                      placeholder="例: 1000000"
                      value={formData.current_cost}
                      onChange={(e) =>
                        setFormData({ ...formData, current_cost: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_reduction_rate">目標削減率（%）</Label>
                    <Input
                      id="target_reduction_rate"
                      type="number"
                      placeholder="例: 30"
                      value={formData.target_reduction_rate}
                      onChange={(e) =>
                        setFormData({ ...formData, target_reduction_rate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    <Calculator className="mr-2 h-4 w-4" />
                    {isLoading ? '計算中...' : '詳細シミュレーション'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleQuickEstimate}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    簡易見積り
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {result?.type === 'quickEstimate' ? '簡易見積り結果' : 'シミュレーション結果'}
              </CardTitle>
              <CardDescription>
                {result?.type === 'quickEstimate' ? '推奨商品と価格帯を表示' : '試算結果を表示'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                result.type === 'simulation'
                  ? renderSimulationResult(result.data)
                  : renderQuickEstimateResult(result.data)
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calculator className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4">パラメータを入力してシミュレーションを実行してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
