import Link from 'next/link'
import { UserPlus, CalendarPlus, Activity, DollarSign, BarChart3, FileText } from 'lucide-react'

const actions = [
  { href: '/patients/new', label: '新增患者', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
  { href: '/appointments/new', label: '预约登记', icon: CalendarPlus, color: 'text-green-600', bg: 'bg-green-50' },
  { href: '/patients', label: '开始治疗', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
  { href: '/finance', label: '收费开单', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
  { href: '/analytics', label: '数据统计', icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { href: '/patients', label: '病历记录', icon: FileText, color: 'text-pink-600', bg: 'bg-pink-50' },
]

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">快捷操作</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all ${action.bg} bg-opacity-40`}
          >
            <action.icon className={`w-6 h-6 ${action.color}`} />
            <span className="text-xs font-medium text-gray-600">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
