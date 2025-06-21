// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals copy.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ConvexClientProvider } from './providers'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chartilyze - AI-Powered Trading Journal',
  description: 'Stop filling endless spreadsheets. Chartilyze automatically captures your TradingView trades, analyzes your psychology, and turns your trading data into meaningful insights.',
  keywords: 'trading journal, AI trading, TradingView, trading psychology, trade analysis',
  authors: [{ name: 'Chartilyze Team' }],
  creator: 'Chartilyze',
  openGraph: {
    title: 'Chartilyze - AI-Powered Trading Journal',
    description: 'Automatically capture trades, analyze psychology, and improve your trading with AI insights.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chartilyze - AI-Powered Trading Journal',
    description: 'Automatically capture trades, analyze psychology, and improve your trading with AI insights.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1f2937',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased`}>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
