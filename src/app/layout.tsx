import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '牙科门诊管理系统',
  description: '专业的牙科门诊管理平台',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full bg-gray-50">
        {children}
      </body>
    </html>
  )
}
