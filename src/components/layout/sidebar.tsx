import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  FileText,
  Calculator,
  Search,
  LogOut,
  MessageSquare,
  Zap,
  FlaskConical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { TenantSwitcher } from '@/components/tenant-switcher'

const mainNavItems = [
  { name: '議事録', href: '/meetings', icon: FileText },
  { name: '提案パイプライン', href: '/proposal-pipeline', icon: Zap },
  { name: '商材チャット', href: '/proposal-chat', icon: MessageSquare },
]

const betaNavItems = [
  { name: '類似検索', href: '/search', icon: Search },
  { name: 'シミュレーション', href: '/simulation', icon: Calculator },
]

export function Sidebar() {
  const router = useRouter()
  const { user, logout } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Sales AI</h1>
      </div>

      <nav className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = router.pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-white'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ベータ版 - 下部に配置 */}
      <div className="px-2 pb-2">
        <div className="flex items-center gap-1 text-xs text-gray-600 px-2 py-1">
          <FlaskConical className="h-3 w-3" />
          ベータ版
        </div>
        <div className="space-y-0.5">
          {betaNavItems.map((item) => {
            const isActive = router.pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md px-2 py-1.5 text-xs font-medium',
                  isActive
                    ? 'bg-gray-800 text-gray-300'
                    : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-2 h-3.5 w-3.5 flex-shrink-0',
                    isActive
                      ? 'text-gray-300'
                      : 'text-gray-600 group-hover:text-gray-400'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="border-t border-gray-800 p-4">
        {user && (
          <>
            {user.tenants && user.tenants.length > 0 && (
              <div className="mb-3">
                <TenantSwitcher
                  tenants={user.tenants}
                  currentTenantId={user.current_tenant_id || user.current_tenant?.tenant_id || user.tenant_id}
                />
              </div>
            )}
            <div className="mb-3">
              <p className="text-sm font-medium text-white truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          ログアウト
        </Button>
      </div>
    </div>
  )
}
