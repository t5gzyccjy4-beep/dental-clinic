import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToday } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')
  const range = request.nextUrl.searchParams.get('range')
  const startDate = request.nextUrl.searchParams.get('startDate')

  let where: Record<string, unknown> = {}

  if (date) {
    where = { date }
  } else if (range === 'today') {
    where = { date: getToday() }
  } else if (range === 'week') {
    const base = startDate ? new Date(startDate) : new Date()
    const weekEnd = new Date(base)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const weekStart = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`
    const weekEndStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`
    where = {
      date: {
        gte: weekStart,
        lte: weekEndStr,
      },
    }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { patient: { select: { name: true, phone: true } } },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  })

  return NextResponse.json({ appointments })
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  const appointment = await prisma.appointment.create({
    data: {
      patientId: data.patientId,
      date: data.date,
      time: data.time,
      doctor: data.doctor || '张医生',
      type: data.type || '初诊',
      status: '已预约',
      notes: data.notes || null,
    },
  })

  // 自动创建预约提醒
  if (data.date) {
    await prisma.reminder.create({
      data: {
        patientId: data.patientId,
        type: '预约',
        remindDate: data.date,
        status: '待提醒',
        message: `预约提醒：${data.type || '初诊'} - ${data.time}`,
      },
    })
  }

  return NextResponse.json({ appointment }, { status: 201 })
}
