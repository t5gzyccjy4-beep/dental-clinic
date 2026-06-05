import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const patientId = request.nextUrl.searchParams.get('patientId')

  const records = await prisma.medicalRecord.findMany({
    where: patientId ? { patientId: parseInt(patientId) } : {},
    include: { patient: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ records })
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  const record = await prisma.medicalRecord.create({
    data: {
      patientId: data.patientId,
      appointmentId: data.appointmentId || null,
      chiefComplaint: data.chiefComplaint || null,
      presentIllness: data.presentIllness || null,
      pastHistory: data.pastHistory || null,
      examination: data.examination || null,
      diagnosis: data.diagnosis || null,
      treatmentPlan: data.treatmentPlan || null,
      doctorNotes: data.doctorNotes || null,
      type: data.type || '初诊',
    },
  })

  return NextResponse.json({ record }, { status: 201 })
}
