import Head from 'next/head'
import { Sidebar } from '@/components/layout/sidebar'
import { useRequireAuth } from '@/hooks/use-auth'
import { useAuth } from '@/hooks/use-auth'
import { ChatPage } from '@maccotaro/ai-micro-lib-frontend/chat'

export default function SalesChatPage() {
  const { user, isLoading } = useRequireAuth()
  const { user: authUser } = useAuth()
  const isSuperAdmin = authUser?.roles?.includes('super_admin') || false
  const isAdmin = authUser?.roles?.includes('super_admin') || authUser?.roles?.includes('admin') || authUser?.roles?.includes('moderator') || false

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  }

  return (
    <>
      <Head><title>KBチャット - Sales AI</title></Head>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <ChatPage isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} title="KBチャット" />
      </div>
    </>
  )
}
