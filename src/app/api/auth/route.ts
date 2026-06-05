import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken, getSession } from '@/lib/auth'
import { createHash } from 'crypto'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ error: '请输入用户名和密码' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user || user.passwordHash !== hashPassword(password)) {
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
  }

  const token = await createToken({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  })

  const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, role: user.role } })
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  return NextResponse.json({ user: { id: session.id, name: session.name, role: session.role } })
}
