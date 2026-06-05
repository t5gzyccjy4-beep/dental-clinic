import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await request.json()

  const updateData: Record<string, unknown> = {}
  if (data.status !== undefined) updateData.status = data.status
  if (data.endDate !== undefined) updateData.endDate = data.endDate
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.items !== undefined) {
    updateData.items = typeof data.items === 'string' ? data.items : JSON.stringify(data.items)
  }

  const treatment = await prisma.treatment.update({
    where: { id: parseInt(id) },
    data: updateData,
  })

  return NextResponse.json({ treatment })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.treatment.delete({
    where: { id: parseInt(id) },
  })

  return NextResponse.json({ success: true })
}
