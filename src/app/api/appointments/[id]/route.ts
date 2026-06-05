import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await request.json()

  const appointment = await prisma.appointment.update({
    where: { id: parseInt(id) },
    data: {
      status: data.status,
      notes: data.notes,
      date: data.date,
      time: data.time,
      type: data.type,
      doctor: data.doctor,
    },
  })

  return NextResponse.json({ appointment })
}
