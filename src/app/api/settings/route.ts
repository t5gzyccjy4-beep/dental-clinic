import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  let settings = await prisma.setting.findFirst()
  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        clinicName: '牙科门诊',
        address: '',
        phone: '',
        defaultReminderDays: '[3,1,0]',
      },
    })
  }

  return NextResponse.json({ settings })
}

export async function PUT(request: Request) {
  const data = await request.json()

  const settings = await prisma.setting.findFirst()
  if (!settings) {
    const created = await prisma.setting.create({ data })
    return NextResponse.json({ settings: created })
  }

  const updated = await prisma.setting.update({
    where: { id: settings.id },
    data: {
      clinicName: data.clinicName,
      address: data.address,
      phone: data.phone,
      defaultReminderDays: data.defaultReminderDays,
    },
  })

  return NextResponse.json({ settings: updated })
}
