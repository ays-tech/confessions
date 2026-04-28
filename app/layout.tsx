import type { Metadata, Viewport } from 'next'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://corperconfessions.ng'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080808',
}

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Corper Confessions 😭 | Anonymous NYSC Stories',
    template: '%s | Corper Confessions',
  },
  description: 'The most painful, funny and relatable anonymous confessions from Nigerian corpers. Share yours — 100% anonymous.',
  keywords: ['NYSC', 'corper', 'corper confessions', 'Nigeria', 'service year', 'camp', 'PPA', 'allowee', 'corper wahala'],
  authors: [{ name: 'Corper Confessions' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CorperConf',
  },
  openGraph: {
    title: 'Corper Confessions 😭',
    description: 'Anonymous confessions from Nigerian corpers. Too real. Too painful. Too funny.',
    url: '/',
    siteName: 'Corper Confessions',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Corper Confessions' }],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corper Confessions 😭',
    description: 'Anonymous confessions from Nigerian corpers. Too real. Too painful. Too funny.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA iOS icons */}
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        {/* Splash screen color for iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-96x96.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
