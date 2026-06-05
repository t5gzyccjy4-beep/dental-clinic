import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const data = await request.json()

  // 创建付款记录
  const payment = await prisma.payment.create({
    data: {
      billId: data.billId,
      amount: data.amount,
      method: data.method || '现金',
    },
  })

  // 更新账单
  const bill = await prisma.bill.findUnique({ where: { id: data.billId } })
  if (bill) {
    const newPaid = bill.paidAmount + data.amount
    const newBalance = bill.totalAmount - newPaid
    await prisma.bill.update({
      where: { id: data.billId },
      data: {
        paidAmount: newPaid,
        balance: newBalance,
        status: newBalance <= 0 ? '已结清' : '未结清',
      },
    })
  }

  return NextResponse.json({ payment }, { status: 201 })
}
