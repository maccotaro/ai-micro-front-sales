import { useState, useCallback } from 'react'
import { Check, ChevronsUpDown, Building2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { switchTenant } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import { UserTenant } from '@/types'

interface TenantSwitcherProps {
  tenants: UserTenant[]
  currentTenantId?: string
}

export function TenantSwitcher({ tenants, currentTenantId }: TenantSwitcherProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const currentTenant = tenants.find((t) => t.id === currentTenantId)
  const displayName = currentTenant?.name || tenants[0]?.name || ''

  const handleSwitch = useCallback(async (tenantId: string) => {
    if (tenantId === currentTenantId) {
      setIsOpen(false)
      return
    }

    setIsSwitching(true)
    try {
      await switchTenant(tenantId)
      window.location.reload()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'テナント切替エラー',
        description: error instanceof Error ? error.message : 'テナント切替に失敗しました',
      })
      setIsSwitching(false)
      setIsOpen(false)
    }
  }, [currentTenantId, toast])

  if (isSwitching) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>切替中...</span>
      </div>
    )
  }

  // Single tenant: text display only
  if (tenants.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-400">
        <Building2 className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{displayName}</span>
      </div>
    )
  }

  // Multiple tenants: dropdown
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        <Building2 className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 truncate text-left">{displayName}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 z-50 mb-1 w-full min-w-[180px] rounded-md border border-gray-700 bg-gray-800 py-1 shadow-lg">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                type="button"
                onClick={() => handleSwitch(tenant.id)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-1.5 text-sm',
                  tenant.id === currentTenantId
                    ? 'text-white bg-gray-700'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                {tenant.id === currentTenantId ? (
                  <Check className="h-3.5 w-3.5 flex-shrink-0" />
                ) : (
                  <span className="h-3.5 w-3.5 flex-shrink-0" />
                )}
                <span className="truncate">{tenant.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
