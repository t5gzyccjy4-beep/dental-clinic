import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToday } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')
  const status = request.nextUrl.searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (status) where.status = status

  const reminders = await prisma.reminder.findMany({
    where,
    include: { patient: { select: { name: true } } },
    orderBy: { remindDate: 'asc' },
  })

  return NextResponse.json({ reminders })
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  const reminder = await prisma.reminder.create({
    data: {
      patientId: data.patientId,
      appointmentId: data.appointmentId || null,
      type: data.type || '复诊',
      remindDate: data.remindDate,
      status: '待提醒',
      message: data.message || null,
    },
  })

  return NextResponse.json({ reminder }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const data = await request.json()

  const updateData: Record<string, unknown> = {}
  if (data.status !== undefined) updateData.status = data.status
  if (data.remindDate !== undefined) updateData.remindDate = data.remindDate
  if (data.type !== undefined) updateData.type = data.type
  if (data.message !== undefined) updateData.message = data.message

  const reminder = await prisma.reminder.update({
    where: { id: data.id },
    data: updateData,
  })

  return NextResponse.json({ reminder })
}
