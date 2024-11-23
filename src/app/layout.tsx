import type { Metadata } from 'next'
import { Raleway, Syne } from 'next/font/google'
// Note: Cormorant Infant needs to use special import syntax for fonts with spaces
import localFont from 'next/font/local'
import './globals.css'
import { UiLayout } from '@/components/layout'
import { SolanaProvider } from '@/components/providers'
import { ThemeProvider } from '@/components/theme'
import { ReactQueryProvider } from './react-query-provider'
import { FullScreenLoader } from '@/components/loading'
import { Suspense } from 'react'

// Initialize fonts
const raleway = Raleway({ 
  subsets: ['latin'],
})

const syne = Syne({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Bricks on Chain',
  description: 'Buy real estate on the blockchain',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${raleway.className} ${syne.className}`}
      >
        <ReactQueryProvider>
          <SolanaProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Suspense fallback={<FullScreenLoader />}>
                <UiLayout>{children}</UiLayout>
              </Suspense>
            </ThemeProvider>
          </SolanaProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}