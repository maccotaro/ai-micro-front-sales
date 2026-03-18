import type { AppProps } from 'next/app'
import '@/lib/auth-init'
import '@/styles/globals.css'
import { Toaster } from '@/components/ui/toaster'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  )
}
