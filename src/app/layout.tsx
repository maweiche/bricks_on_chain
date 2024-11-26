import type { Metadata } from 'next'
import { Raleway, Cormorant_Infant, Syne } from 'next/font/google'
import './globals.css'
import { UiLayout } from '@/components/layout'
import { ApolloWrapper, SolanaProvider } from '@/components/providers'
import { ThemeProvider } from '@/components/theme'
import { ReactQueryProvider } from './react-query-provider'
import { FullScreenLoader } from '@/components/loading'
import { Suspense } from 'react'

// Initialize fonts
const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
})

const cormorant = Cormorant_Infant({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
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
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${raleway.variable} ${cormorant.variable} ${syne.variable}`}
      >
        <ApolloWrapper>
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
        </ApolloWrapper>
      </body>
    </html>
  )
}
