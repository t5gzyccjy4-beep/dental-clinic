import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await request.json()

  const record = await prisma.medicalRecord.update({
    where: { id: parseInt(id) },
    data: {
      chiefComplaint: data.chiefComplaint ?? null,
      presentIllness: data.presentIllness ?? null,
      pastHistory: data.pastHistory ?? null,
      examination: data.examination ?? null,
      diagnosis: data.diagnosis ?? null,
      treatmentPlan: data.treatmentPlan ?? null,
      doctorNotes: data.doctorNotes ?? null,
      type: data.type,
    },
  })

  return NextResponse.json({ record })
}
