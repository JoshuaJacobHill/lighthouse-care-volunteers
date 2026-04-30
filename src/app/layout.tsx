import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toast'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Lighthouse Care Volunteers',
    template: '%s | Lighthouse Care Volunteers',
  },
  description:
    'The volunteer management portal for Lighthouse Care — an Australian not-for-profit providing affordable groceries and food relief to families across South East Queensland.',
  keywords: ['volunteer', 'Lighthouse Care', 'Logan', 'Queensland', 'charity', 'food relief'],
  authors: [{ name: 'Lighthouse Care' }],
  openGraph: {
    siteName: 'Lighthouse Care Volunteers',
    locale: 'en_AU',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-AU" className={inter.className}>
      <body className="min-h-screen flex flex-col antialiased">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
