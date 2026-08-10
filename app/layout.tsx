import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'MRV Logística | Governança e Conciliação de Custos',
  description:
    'Plataforma corporativa de governança logística, rastreabilidade e conciliação financeira da MRV.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#d97706',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`light ${geistSans.variable} ${geistMono.variable}`} style={{ backgroundColor: '#fafaf9', color: '#333333' }}>
      <body className="font-sans antialiased" style={{ backgroundColor: '#fafaf9', color: '#333333' }}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
