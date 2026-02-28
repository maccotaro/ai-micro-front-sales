import { useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FactCheckClaim, FactCheckResult } from '@/types'

interface FactCheckWarningsProps {
  factCheck: FactCheckResult
}

const STATUS_CONFIG = {
  verified: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    label: '検証済',
    badgeClass: 'bg-green-100 text-green-700',
  },
  unverified: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-yellow-50 border-yellow-200',
    label: '未検証',
    badgeClass: 'bg-yellow-100 text-yellow-700',
  },
  contradicted: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    label: '矛盾あり',
    badgeClass: 'bg-red-100 text-red-700',
  },
}

function ClaimItem({ claim }: { claim: FactCheckClaim }) {
  const [open, setOpen] = useState(false)
  const config = STATUS_CONFIG[claim.status] || STATUS_CONFIG.unverified
  const Icon = config.icon

  return (
    <div className={cn('rounded border p-2', config.bg)}>
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <Icon className={cn('h-4 w-4 shrink-0', config.color)} />
        <span className="text-sm text-gray-800 flex-1">{claim.claim}</span>
        <Badge className={cn('text-[10px] px-1.5 py-0', config.badgeClass)}>{config.label}</Badge>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        )}
      </div>
      {open && (
        <div className="mt-2 pl-6 space-y-1 text-xs">
          {claim.source && (
            <p className="text-gray-600"><span className="font-medium">根拠:</span> {claim.source}</p>
          )}
          {claim.note && (
            <p className="text-gray-500"><span className="font-medium">補足:</span> {claim.note}</p>
          )}
        </div>
      )}
    </div>
  )
}

export function FactCheckWarnings({ factCheck }: FactCheckWarningsProps) {
  if (!factCheck) return null

  const claims = factCheck.claims || []
  const allVerified = claims.length > 0 && claims.every((c) => c.status === 'verified')

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">ファクトチェック</h4>

      {allVerified ? (
        <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 p-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">全項目が検証済みです</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {claims.map((claim, i) => (
            <ClaimItem key={i} claim={claim} />
          ))}
        </div>
      )}

      {factCheck.summary && (
        <p className="text-xs text-gray-500 mt-2">{factCheck.summary}</p>
      )}
    </div>
  )
}
