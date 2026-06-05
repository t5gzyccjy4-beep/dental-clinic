import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const patientId = request.nextUrl.searchParams.get('patientId')

  const where: Record<string, unknown> = {}
  if (patientId) where.patientId = parseInt(patientId)

  const treatments = await prisma.treatment.findMany({
    where,
    include: { patient: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ treatments })
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  const treatment = await prisma.treatment.create({
    data: {
      patientId: data.patientId,
      recordId: data.recordId || null,
      items: typeof data.items === 'string' ? data.items : JSON.stringify(data.items),
      status: data.status || '进行中',
      startDate: data.startDate,
      endDate: data.endDate || null,
      notes: data.notes || null,
    },
  })

  return NextResponse.json({ treatment }, { status: 201 })
}
