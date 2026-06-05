import { prisma } from '@/lib/prisma'
import { getToday, getFirstDayOfMonth, formatMoney } from '@/lib/utils'
import StatCard from '@/components/dashboard/StatCard'
import TodayAppointments from '@/components/dashboard/TodayAppointments'
import QuickActions from '@/components/dashboard/QuickActions'
import RevenueChart from '@/components/analytics/RevenueChart'
import TreatmentPieChart from '@/components/analytics/TreatmentPieChart'
import { Calendar, DollarSign, Users, AlertTriangle, UserPlus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const today = getToday()
  const firstDay = getFirstDayOfMonth()

  const [
    todayAppointments,
    monthRevenue,
    pendingVisits,
    arrearsCount,
    todayRevenue,
    newPatientsMonth,
  ] = await Promise.all([
    // 今日预约
    prisma.appointment.count({ where: { date: today, status: { not: '已取消' } } }),
    // 本月收入
    prisma.payment.aggregate({
      where: { createdAt: { gte: new Date(firstDay) } },
      _sum: { amount: true },
    }),
    // 待复诊 - 今天之前的复诊提醒
    prisma.reminder.count({
      where: { type: '复诊', status: '待提醒', remindDate: { lte: today } },
    }),
    // 欠费患者数
    prisma.bill.count({
      where: { status: '未结清' },
    }),
    // 今日收入
    prisma.payment.aggregate({
      where: { createdAt: { gte: new Date(today) } },
      _sum: { amount: true },
    }),
    // 本月新增患者
    prisma.patient.count({
      where: { createdAt: { gte: new Date(firstDay) } },
    }),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">工作台</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="今日预约"
          value={String(todayAppointments)}
          suffix="人"
          icon={Calendar}
          color="blue"
          href={`/appointments?date=${today}`}
        />
        <StatCard
          title="今日收入"
          value={formatMoney(todayRevenue._sum.amount || 0)}
          icon={DollarSign}
          color="green"
          href="/finance/revenue"
        />
        <StatCard
          title="本月收入"
          value={formatMoney(monthRevenue._sum.amount || 0)}
          icon={DollarSign}
          color="emerald"
          href="/finance/revenue"
        />
        <StatCard
          title="本月新增患者"
          value={String(newPatientsMonth)}
          suffix="人"
          icon={UserPlus}
          color="purple"
          href="/patients"
        />
        <StatCard
          title="欠费患者"
          value={String(arrearsCount)}
          suffix="人"
          icon={AlertTriangle}
          color="red"
          href="/finance"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 今日预约列表 */}
        <div className="lg:col-span-2">
          <TodayAppointments date={today} />
        </div>

        {/* 快捷操作 */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* 经营驾驶舱图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">本月收入趋势</h3>
          <RevenueChart />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">治疗项目排行</h3>
          <TreatmentPieChart />
        </div>
      </div>
    </div>
  )
}
