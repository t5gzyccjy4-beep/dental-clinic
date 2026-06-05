'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, LogOut, User, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSidebar } from './SidebarContext'

interface SessionUser {
  id: number
  name: string
  role: string
}

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [unreadReminders, setUnreadReminders] = useState(0)
  const { toggle } = useSidebar()

  useEffect(() => {
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/reminders?status=待提醒')
      .then(res => res.json())
      .then(data => {
        if (data.reminders) {
          const today = new Date().toISOString().split('T')[0]
          const urgent = data.reminders.filter((r: { remindDate: string; status: string }) =>
            r.remindDate <= today! && r.status === '待提醒'
          ).length
          setUnreadReminders(urgent)
        }
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 lg:ml-60">
      <div className="flex items-center gap-3">
        {/* 手机端汉堡菜单 */}
        <button onClick={toggle} className="lg:hidden p-2 -ml-1 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base lg:text-lg font-semibold text-gray-800 hidden sm:block">牙科门诊管理系统</h2>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <Link
          href="/reminders"
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="提醒中心"
        >
          <Bell className="w-5 h-5" />
          {unreadReminders > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadReminders > 99 ? '99+' : unreadReminders}
            </span>
          )}
        </Link>

        {user && (
          <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200">
            <Link href="/users" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">{user.name}</p>
                <p className="text-xs text-gray-400">
                  {user.role === 'admin' ? '管理员' : user.role === 'doctor' ? '医生' : '前台'}
                </p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
