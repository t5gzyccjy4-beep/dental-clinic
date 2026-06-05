import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search') || ''
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit
  const gender = request.nextUrl.searchParams.get('gender') || ''
  const startDate = request.nextUrl.searchParams.get('startDate') || ''
  const endDate = request.nextUrl.searchParams.get('endDate') || ''
  const hasAllergies = request.nextUrl.searchParams.get('hasAllergies') || ''
  const hasHistory = request.nextUrl.searchParams.get('hasHistory') || ''
  const noVisitMonths = parseInt(request.nextUrl.searchParams.get('noVisitMonths') || '0')
  const sortBy = request.nextUrl.searchParams.get('sortBy') || 'updatedAt'
  const sortDir = request.nextUrl.searchParams.get('sortDir') || 'desc'

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
    ]
  }
  if (gender) where.gender = gender
  if (hasAllergies === 'yes') where.allergies = { not: null }
  if (hasAllergies === 'no') where.allergies = null
  if (hasHistory === 'yes') where.medicalHistory = { not: null }
  if (hasHistory === 'no') where.medicalHistory = null
  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate + 'T23:59:59.999Z')
    where.createdAt = dateFilter
  }

  // 排序映射
  const orderMap: Record<string, Record<string, string>> = {
    createdAt: { createdAt: sortDir },
    updatedAt: { updatedAt: sortDir },
    name: { name: sortDir },
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      include: {
        appointments: { orderBy: { date: 'desc' }, take: 1, select: { date: true } },
        bills: { select: { balance: true, status: true } },
        _count: { select: { appointments: true, bills: true } },
      },
      orderBy: orderMap[sortBy] || { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ])

  // 计算3个月前日期（用于未复诊筛选）
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - (noVisitMonths || 3))
  const cutoffDate = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}-${String(threeMonthsAgo.getDate()).padStart(2, '0')}`

  let enriched = patients.map(p => {
    const totalArrears = p.bills
      .filter(b => b.status === '未结清')
      .reduce((s, b) => s + b.balance, 0)
    return {
      id: p.id,
      name: p.name,
      gender: p.gender,
      birthday: p.birthday,
      phone: p.phone,
      address: p.address,
      allergies: p.allergies,
      medicalHistory: p.medicalHistory,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      lastVisitDate: p.appointments[0]?.date || null,
      appointmentCount: p._count.appointments,
      billCount: p._count.bills,
      totalArrears,
      hasAllergies: !!p.allergies,
      hasHistory: !!p.medicalHistory,
    }
  })

  // 未复诊筛选（需要在应用层过滤，因为涉及关联表聚合）
  if (noVisitMonths > 0) {
    enriched = enriched.filter(p => {
      if (!p.lastVisitDate) return true // 从未就诊也算
      return p.lastVisitDate < cutoffDate
    })
  }

  return NextResponse.json({
    patients: enriched,
    total: noVisitMonths > 0 ? enriched.length : total,
    page,
    totalPages: Math.ceil((noVisitMonths > 0 ? enriched.length : total) / limit),
  })
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  const patient = await prisma.patient.create({
    data: {
      name: data.name,
      gender: data.gender || '男',
      birthday: data.birthday || null,
      phone: data.phone || null,
      wechat: data.wechat || null,
      address: data.address || null,
      allergies: data.allergies || null,
      medicalHistory: data.medicalHistory || null,
      notes: data.notes || null,
    },
  })

  return NextResponse.json({ patient }, { status: 201 })
}
