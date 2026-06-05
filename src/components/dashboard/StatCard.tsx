import Link from 'next/link'
import { type LucideIcon, ChevronRight } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  suffix?: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'emerald' | 'purple' | 'red' | 'orange'
  href?: string
}

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
  red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
}

export default function StatCard({ title, value, suffix, icon: Icon, color, href }: StatCardProps) {
  const c = colorMap[color]

  const content = (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 ${href ? 'hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-lg ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${c.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">
          {value}
          {suffix && <span className="text-sm font-normal text-gray-400 ml-0.5">{suffix}</span>}
        </p>
      </div>
      {href && <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
