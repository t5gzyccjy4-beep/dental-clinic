import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const data = await request.json()
  const { ids, action } = data

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: '请提供患者ID列表' }, { status: 400 })
  }

  if (action === 'delete') {
    await prisma.patient.deleteMany({
      where: { id: { in: ids } },
    })
    return NextResponse.json({ success: true, deleted: ids.length })
  }

  if (action === 'create-reminders') {
    const remindDate = data.remindDate || new Date().toISOString().split('T')[0]!
    const message = data.message || '请及时复诊'

    const reminders = await Promise.all(
      ids.map((patientId: number) =>
        prisma.reminder.create({
          data: {
            patientId,
            type: '复诊',
            remindDate,
            status: '待提醒',
            message,
          },
        }).catch(() => null)
      )
    )

    return NextResponse.json({ success: true, created: reminders.filter(Boolean).length })
  }

  return NextResponse.json({ error: '未知操作' }, { status: 400 })
}
