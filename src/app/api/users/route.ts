import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createHash } from 'crypto'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

// GET - 获取所有用户（仅管理员）
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ users })
}

// POST - 创建新用户（仅管理员）
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const data = await request.json()

  if (!data.username || !data.password || !data.name) {
    return NextResponse.json({ error: '请填写用户名、密码和姓名' }, { status: 400 })
  }

  // 检查用户名是否已存在
  const existing = await prisma.user.findUnique({ where: { username: data.username } })
  if (existing) {
    return NextResponse.json({ error: '用户名已存在' }, { status: 409 })
  }

  const user = await prisma.user.create({
    data: {
      username: data.username,
      passwordHash: hashPassword(data.password),
      name: data.name,
      role: data.role || 'doctor',
    },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ user }, { status: 201 })
}
