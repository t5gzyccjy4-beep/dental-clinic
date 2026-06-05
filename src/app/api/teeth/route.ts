import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const patientId = request.nextUrl.searchParams.get('patientId')

  if (!patientId) {
    return NextResponse.json({ error: 'patientId required' }, { status: 400 })
  }

  const teeth = await prisma.toothRecord.findMany({
    where: { patientId: parseInt(patientId) },
    orderBy: { toothNumber: 'asc' },
  })

  return NextResponse.json({ teeth })
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  const tooth = await prisma.toothRecord.upsert({
    where: {
      patientId_toothNumber: {
        patientId: data.patientId,
        toothNumber: data.toothNumber,
      },
    },
    update: {
      status: data.status,
      note: data.note || null,
      recordId: data.recordId || null,
    },
    create: {
      patientId: data.patientId,
      recordId: data.recordId || null,
      toothNumber: data.toothNumber,
      status: data.status || '正常',
      note: data.note || null,
    },
  })

  return NextResponse.json({ tooth }, { status: 200 })
}
