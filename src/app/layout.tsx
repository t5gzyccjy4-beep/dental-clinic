import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '牙科门诊管理系统',
  description: '专业的牙科门诊管理平台',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: '牙科系统',
    statusBarStyle: 'black-translucent',
  },
  applicationName: '牙科门诊管理系统',
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="h-full bg-gray-50">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {})
                })
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
}
