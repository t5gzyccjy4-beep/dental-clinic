import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Clock, User } from 'lucide-react'

export default async function TodayAppointments({ date }: { date: string }) {
  const appointments = await prisma.appointment.findMany({
    where: { date, status: { not: '已取消' } },
    include: { patient: { select: { name: true, phone: true } } },
    orderBy: { time: 'asc' },
  })

  const statusColors: Record<string, string> = {
    '已预约': 'bg-blue-100 text-blue-700',
    '已到诊': 'bg-green-100 text-green-700',
    '已过期': 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">今日预约</h3>
        <Link
          href="/appointments"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          查看全部 →
        </Link>
      </div>
      <div className="divide-y divide-gray-50">
        {appointments.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400">
            <p>今日暂无预约</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <Link
                    href={`/patients/${appt.patientId}`}
                    className="text-sm font-medium text-gray-800 hover:text-blue-600"
                  >
                    {appt.patient.name}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {appt.type} · {appt.doctor || '未指定'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[appt.status] || 'bg-gray-100'}`}>
                  {appt.status}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {appt.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
