import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ShochikubaiProposal, ShochikubaiTier } from '@/types'
import { Star } from 'lucide-react'

export interface BudgetRange {
  min: number | null
  max: number | null
}

interface ShochikubaiComparisonProps {
  proposals: ShochikubaiProposal[]
  totalBudgetRange?: {
    matsu_total: number
    take_total: number
    ume_total: number
  }
  customerBudget?: BudgetRange | null
}

const TIER_CONFIG = {
  matsu: { label: '松', color: 'bg-amber-100 text-amber-800 border-amber-300', headerBg: 'bg-amber-50' },
  take: { label: '竹', color: 'bg-green-100 text-green-800 border-green-300', headerBg: 'bg-green-50' },
  ume: { label: '梅', color: 'bg-blue-100 text-blue-800 border-blue-300', headerBg: 'bg-blue-50' },
} as const

function formatPrice(price: number | null | undefined): string {
  if (price == null) return '-'
  return `¥${price.toLocaleString()}`
}

function getBudgetBadge(totalPrice: number, budget: BudgetRange | null | undefined) {
  if (!budget || (budget.min == null && budget.max == null)) {
    return { label: '予算未設定', className: 'bg-gray-100 text-gray-500' }
  }
  const maxBudget = budget.max ?? budget.min
  if (maxBudget != null && totalPrice <= maxBudget) {
    return { label: '予算内', className: 'bg-green-100 text-green-700' }
  }
  return { label: '予算超過', className: 'bg-red-100 text-red-700' }
}

function TierCard({
  tierKey,
  tier,
  isRecommended,
  customerBudget,
}: {
  tierKey: 'matsu' | 'take' | 'ume'
  tier: ShochikubaiTier
  isRecommended: boolean
  customerBudget?: BudgetRange | null
}) {
  const config = TIER_CONFIG[tierKey]
  const budgetBadge = getBudgetBadge(tier.total_price, customerBudget)

  return (
    <Card className={cn('relative', isRecommended && 'ring-2 ring-blue-400 border-blue-400')}>
      {isRecommended && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <Badge className="bg-blue-500 text-white text-xs gap-1">
            <Star className="h-3 w-3" />
            推奨
          </Badge>
        </div>
      )}
      <CardHeader className={cn('py-2 px-3', config.headerBg)}>
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Badge className={config.color}>{config.label}</Badge>
            <Badge className={cn('text-[10px] px-1.5 py-0', budgetBadge.className)}>
              {budgetBadge.label}
            </Badge>
          </div>
          <span className="text-base font-bold">{formatPrice(tier.total_price)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-2">
        <table className="w-full text-xs mb-2">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1 font-medium text-gray-600">媒体</th>
              <th className="text-left py-1 font-medium text-gray-600">商品</th>
              <th className="text-right py-1 font-medium text-gray-600">料金</th>
            </tr>
          </thead>
          <tbody>
            {tier.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-1 text-gray-700">{item.media_name}</td>
                <td className="py-1 text-gray-700">{item.product_name}</td>
                <td className="py-1 text-right text-gray-700">
                  {item.campaign_discount ? (
                    <span>
                      <span className="line-through text-gray-400 mr-1">{formatPrice(item.price)}</span>
                      {formatPrice(item.final_price)}
                    </span>
                  ) : (
                    formatPrice(item.final_price)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-600 mb-1">
          <span className="font-medium">期待効果:</span> {tier.expected_effect}
        </p>
        <p className="text-xs text-gray-500">
          <span className="font-medium">選定理由:</span> {tier.rationale}
        </p>
      </CardContent>
    </Card>
  )
}

export function ShochikubaiComparison({ proposals, totalBudgetRange, customerBudget }: ShochikubaiComparisonProps) {
  if (!proposals?.length) return null

  return (
    <div className="space-y-4 mb-4">
      {proposals.map((proposal, idx) => (
        <div key={idx}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">課題 {proposal.issue_id}</span>
            {proposal.recommendation_reason && (
              <span className="text-xs text-gray-400">— {proposal.recommendation_reason}</span>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {(['matsu', 'take', 'ume'] as const).map((tierKey) => (
              <TierCard
                key={tierKey}
                tierKey={tierKey}
                tier={proposal.shochikubai[tierKey]}
                isRecommended={proposal.recommended === tierKey}
                customerBudget={customerBudget}
              />
            ))}
          </div>
        </div>
      ))}
      {totalBudgetRange && (
        <div className="flex gap-4 text-xs text-gray-500 justify-end">
          <span>松合計: {formatPrice(totalBudgetRange.matsu_total)}</span>
          <span>竹合計: {formatPrice(totalBudgetRange.take_total)}</span>
          <span>梅合計: {formatPrice(totalBudgetRange.ume_total)}</span>
        </div>
      )}
    </div>
  )
}
