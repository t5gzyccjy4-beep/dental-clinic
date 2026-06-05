import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// PUT - 更新用户信息（仅管理员）
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { id } = await params
  const data = await request.json()

  const updateData: Record<string, string> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.role !== undefined) updateData.role = data.role
  if (data.username !== undefined) updateData.username = data.username

  // 检查用户名是否已存在
  if (data.username) {
    const existing = await prisma.user.findUnique({ where: { username: data.username } })
    if (existing && existing.id !== parseInt(id)) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 })
    }
  }

  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data: updateData,
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ user })
}

// DELETE - 删除用户（仅管理员，不能删除自己）
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { id } = await params
  const userId = parseInt(id)

  if (session.id === userId) {
    return NextResponse.json({ error: '不能删除自己的账号' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: userId } })

  return NextResponse.json({ success: true })
}
