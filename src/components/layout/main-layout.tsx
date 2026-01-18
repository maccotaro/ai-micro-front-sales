import { ReactNode } from 'react'
import Head from 'next/head'
import { Sidebar } from './sidebar'
import { useRequireAuth } from '@/hooks/use-auth'

interface MainLayoutProps {
  children: ReactNode
  title?: string
}

export function MainLayout({ children, title = 'Sales AI' }: MainLayoutProps) {
  const { user, isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    // Redirecting to login - show loading spinner
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="営業支援AIサービス" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen bg-gray-100">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
