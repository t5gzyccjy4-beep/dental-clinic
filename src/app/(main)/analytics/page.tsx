'use client'

import { useState, useEffect } from 'react'
import { formatMoney } from '@/lib/utils'
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'
import RevenueChart from '@/components/analytics/RevenueChart'
import TreatmentPieChart from '@/components/analytics/TreatmentPieChart'

interface Stats {
  todayRevenue: number
  monthRevenue: number
  totalPatients: number
  monthNewPatients: number
  arrearsTotal: number
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats>({
    todayRevenue: 0, monthRevenue: 0, totalPatients: 0, monthNewPatients: 0, arrearsTotal: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const [patientsRes, billsRes] = await Promise.all([
      fetch('/api/patients?limit=1000'),
      fetch('/api/bills'),
    ])
    const patientsData = await patientsRes.json()
    const billsData = await billsRes.json()

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`

    const todayPayments = billsData.bills.flatMap((b: Record<string, unknown>) =>
      (b.payments as Array<Record<string, unknown>> || []).filter((p: Record<string, unknown>) =>
        (p.createdAt as string).startsWith(todayStr)
      )
    )
    const monthPayments = billsData.bills.flatMap((b: Record<string, unknown>) =>
      (b.payments as Array<Record<string, unknown>> || []).filter((p: Record<string, unknown>) =>
        (p.createdAt as string) >= monthStart
      )
    )

    setStats({
      todayRevenue: todayPayments.reduce((s: number, p: Record<string, unknown>) => s + (p.amount as number || 0), 0),
      monthRevenue: monthPayments.reduce((s: number, p: Record<string, unknown>) => s + (p.amount as number || 0), 0),
      totalPatients: patientsData.total,
      monthNewPatients: patientsData.patients.filter((p: Record<string, unknown>) => (p.createdAt as string) >= monthStart).length,
      arrearsTotal: billsData.bills.reduce((s: number, b: Record<string, unknown>) => s + ((b.balance as number) || 0), 0),
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">数据分析</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2"><DollarSign className="w-5 h-5" /><span className="text-sm text-gray-500">今日收入</span></div>
          <p className="text-xl font-bold">{formatMoney(stats.todayRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2"><TrendingUp className="w-5 h-5" /><span className="text-sm text-gray-500">本月收入</span></div>
          <p className="text-xl font-bold">{formatMoney(stats.monthRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2"><Users className="w-5 h-5" /><span className="text-sm text-gray-500">总患者数</span></div>
          <p className="text-xl font-bold">{stats.totalPatients}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-orange-600 mb-2"><BarChart3 className="w-5 h-5" /><span className="text-sm text-gray-500">本月新增</span></div>
          <p className="text-xl font-bold">{stats.monthNewPatients}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">本月收入趋势</h3>
          <RevenueChart />
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">治疗项目排行</h3>
          <TreatmentPieChart />
        </div>
      </div>
    </div>
  )
}
