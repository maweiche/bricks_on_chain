import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

import { UiLayout } from '@/components/layout'
import { SolanaProvider } from '@/components/providers'
import { ThemeProvider } from '@/components/theme'

import { ReactQueryProvider } from './react-query-provider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ReactQueryProvider>
          <SolanaProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <UiLayout>{children}</UiLayout>
            </ThemeProvider>
          </SolanaProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
