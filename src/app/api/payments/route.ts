import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const startDate = request.nextUrl.searchParams.get('startDate')
  const endDate = request.nextUrl.searchParams.get('endDate')
  const method = request.nextUrl.searchParams.get('method')

  const where: Record<string, unknown> = {}
  if (startDate || endDate) {
    const dateFilter: Record<string, string | Date> = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate + 'T23:59:59')
    where.createdAt = dateFilter
  }
  if (method) where.method = method

  const payments = await prisma.payment.findMany({
    where,
    include: {
      bill: {
        select: {
          patient: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // 按日期汇总
  const dailyRevenue: Record<string, number> = {}
  const methodStats: Record<string, number> = {}
  payments.forEach(p => {
    const day = p.createdAt.toISOString().split('T')[0]!
    dailyRevenue[day] = (dailyRevenue[day] || 0) + p.amount
    methodStats[p.method] = (methodStats[p.method] || 0) + p.amount
  })

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0)

  return NextResponse.json({
    payments: payments.map(p => ({
      id: p.id,
      amount: p.amount,
      method: p.method,
      createdAt: p.createdAt.toISOString(),
      patientName: p.bill?.patient?.name || '未知',
      patientId: p.bill?.patient?.id || null,
      billId: p.billId,
    })),
    totalRevenue,
    dailyRevenue,
    methodStats,
  })
}
