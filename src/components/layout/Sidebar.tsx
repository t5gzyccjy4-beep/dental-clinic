'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, Calendar, FileText, Activity,
  DollarSign, Image, Bell, BarChart3, Settings, Stethoscope, Shield, X,
} from 'lucide-react'
import { useSidebar } from './SidebarContext'

interface MenuItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  minRole: string
}

const allMenuItems: MenuItem[] = [
  { href: '/', label: '工作台', icon: LayoutDashboard, minRole: 'receptionist' },
  { href: '/patients', label: '患者管理', icon: Users, minRole: 'receptionist' },
  { href: '/appointments', label: '预约中心', icon: Calendar, minRole: 'receptionist' },
  { href: '/finance', label: '财务管理', icon: DollarSign, minRole: 'doctor' },
  { href: '/analytics', label: '数据分析', icon: BarChart3, minRole: 'doctor' },
  { href: '/reminders', label: '提醒中心', icon: Bell, minRole: 'receptionist' },
  { href: '/users', label: '用户管理', icon: Shield, minRole: 'admin' },
  { href: '/settings', label: '系统设置', icon: Settings, minRole: 'admin' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [role, setRole] = useState<string>('receptionist')
  const { open, close } = useSidebar()

  useEffect(() => {
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (data.user?.role) setRole(data.user.role)
      })
      .catch(() => {})
  }, [])

  // 路由变化时关闭侧栏
  useEffect(() => { close() }, [pathname])

  const roleLevel: Record<string, number> = { admin: 3, doctor: 2, receptionist: 1 }
  const menuItems = allMenuItems.filter(item => (roleLevel[role] || 0) >= (roleLevel[item.minRole] || 0))

  return (
    <>
      {/* 手机端遮罩 */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={close} />}

      <aside className={`
        fixed left-0 top-0 z-50 h-screen w-60 bg-sidebar text-white flex flex-col
        transition-transform duration-300
        lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo + 关闭按钮(手机端) */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <Stethoscope className="w-7 h-7 text-blue-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold leading-tight truncate">牙科管理系统</h1>
            <p className="text-xs text-white/50">康美口腔门诊部</p>
          </div>
          <button onClick={close} className="lg:hidden p-1 hover:bg-white/10 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
              || (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-active text-white shadow-lg'
                    : 'text-white/70 hover:bg-sidebar-hover hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 text-xs text-white/40">
          <p>© 2026 康美口腔门诊部</p>
        </div>
      </aside>
    </>
  )
}
