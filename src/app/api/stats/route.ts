import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFirstDayOfMonth, getToday } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')
  const today = getToday()
  const firstDay = getFirstDayOfMonth()

  switch (type) {
    case 'monthly-revenue': {
      // 本月每天收入
      const days: { date: string; amount: number }[] = []
      const now = new Date()
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        const dayStart = new Date(dateStr)
        const dayEnd = new Date(dateStr)
        dayEnd.setDate(dayEnd.getDate() + 1)

        const result = await prisma.payment.aggregate({
          where: { createdAt: { gte: dayStart, lt: dayEnd } },
          _sum: { amount: true },
        })

        days.push({
          date: `${String(now.getMonth() + 1).padStart(2, '0')}/${String(d).padStart(2, '0')}`,
          amount: result._sum.amount || 0,
        })
      }

      return NextResponse.json({ data: days })
    }

    case 'treatment-ranking': {
      // 治疗项目排行 (从 TreatmentItem 中取得)
      const items = await prisma.treatmentItem.findMany()

      // 统计每个治疗项目在 bills 中出现的次数
      const treatments = await prisma.treatment.findMany({
        select: { items: true },
      })

      const ranking: Record<string, number> = {}
      for (const t of treatments) {
        try {
          const parsed = JSON.parse(t.items) as Array<{ name: string; price: number }>
          for (const ti of parsed) {
            ranking[ti.name] = (ranking[ti.name] || 0) + 1
          }
        } catch { /* skip invalid JSON */ }
      }

      const data = Object.entries(ranking)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)

      return NextResponse.json({ data })
    }

    default:
      return NextResponse.json({ error: 'Unknown stats type' }, { status: 400 })
  }
}
