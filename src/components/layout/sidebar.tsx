import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  FileText,
  Lightbulb,
  Calculator,
  Search,
  Network,
  LogOut,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: Home },
  { name: '議事録', href: '/meetings', icon: FileText },
  { name: '提案書', href: '/proposals', icon: Lightbulb },
  { name: 'シミュレーション', href: '/simulation', icon: Calculator },
  { name: '類似検索', href: '/search', icon: Search },
  { name: 'グラフ推薦', href: '/graph', icon: Network },
]

export function Sidebar() {
  const router = useRouter()
  const { user, logout } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Sales AI</h1>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
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
      </nav>

      <div className="border-t border-gray-800 p-4">
        {user && (
          <div className="mb-3">
            <p className="text-sm font-medium text-white truncate">
              {user.name || user.email}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
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
