import type React from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ToastProvider } from '@/components/providers/toast-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'

const geist = Geist({ subsets: ['latin'] })
const geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Forum',
  description: 'AI-powered community forum with real-time discussions',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        <AuthProvider>
          <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
