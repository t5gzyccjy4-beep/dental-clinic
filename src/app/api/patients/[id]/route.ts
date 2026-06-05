import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const patient = await prisma.patient.findUnique({
    where: { id: parseInt(id) },
    include: {
      appointments: { orderBy: { date: 'desc' }, take: 10 },
      medicalRecords: { orderBy: { createdAt: 'desc' }, take: 10 },
      toothRecords: { orderBy: { toothNumber: 'asc' } },
      treatments: { orderBy: { createdAt: 'desc' } },
      bills: { include: { payments: true }, orderBy: { createdAt: 'desc' } },
      images: { orderBy: { createdAt: 'desc' } },
      reminders: { orderBy: { remindDate: 'asc' } },
    },
  })

  if (!patient) {
    return NextResponse.json({ error: '患者不存在' }, { status: 404 })
  }

  return NextResponse.json({ patient })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await request.json()

  const patient = await prisma.patient.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name,
      gender: data.gender,
      birthday: data.birthday,
      phone: data.phone,
      wechat: data.wechat,
      address: data.address,
      allergies: data.allergies,
      medicalHistory: data.medicalHistory,
      notes: data.notes,
    },
  })

  return NextResponse.json({ patient })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.patient.delete({
    where: { id: parseInt(id) },
  })

  return NextResponse.json({ success: true })
}
