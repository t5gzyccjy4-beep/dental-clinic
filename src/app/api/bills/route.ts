import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const patientId = request.nextUrl.searchParams.get('patientId')
  const status = request.nextUrl.searchParams.get('status')
  const startDate = request.nextUrl.searchParams.get('startDate')
  const endDate = request.nextUrl.searchParams.get('endDate')

  const where: Record<string, unknown> = {}
  if (patientId) where.patientId = parseInt(patientId)
  if (status) where.status = status
  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate + 'T23:59:59.999Z')
    where.createdAt = dateFilter
  }

  const bills = await prisma.bill.findMany({
    where,
    include: {
      patient: { select: { name: true } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ bills })
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  const bill = await prisma.bill.create({
    data: {
      patientId: data.patientId,
      treatmentId: data.treatmentId || null,
      totalAmount: data.totalAmount,
      paidAmount: 0,
      balance: data.totalAmount,
      status: '未结清',
    },
  })

  return NextResponse.json({ bill }, { status: 201 })
}
