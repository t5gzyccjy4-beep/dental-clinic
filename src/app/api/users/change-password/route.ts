import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createHash } from 'crypto'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const data = await request.json()
  const { oldPassword, newPassword, targetUserId } = data

  // 管理员可以为其他用户重置密码
  if (targetUserId && session.role === 'admin') {
    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: '新密码至少4位' }, { status: 400 })
    }
    await prisma.user.update({
      where: { id: targetUserId },
      data: { passwordHash: hashPassword(newPassword) },
    })
    return NextResponse.json({ success: true, message: '密码已重置' })
  }

  // 普通修改密码：需要旧密码验证
  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: '请输入旧密码和新密码' }, { status: 400 })
  }

  if (newPassword.length < 4) {
    return NextResponse.json({ error: '新密码至少4位' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } })
  if (!user || user.passwordHash !== hashPassword(oldPassword)) {
    return NextResponse.json({ error: '旧密码错误' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { passwordHash: hashPassword(newPassword) },
  })

  return NextResponse.json({ success: true, message: '密码修改成功' })
}
