import { type NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env['JWT_SECRET'] || 'dental-clinic-secret-key-change-in-production'
)

const PUBLIC_PATHS = ['/login', '/api/auth']

// 需要特定角色的路径
const ADMIN_ONLY_PATHS = ['/api/users', '/api/settings', '/users', '/settings']
// 禁止前台访问的 API（写操作相关）
const DOCTOR_PLUS_API = [
  '/api/patients/batch',
  '/api/bills',
  '/api/records',
  '/api/treatments',
  '/api/images',
  '/api/payments',
  '/api/stats',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 允许公开路径
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return
  }

  // 允许静态资源
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/uploads') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico)$/)
  ) {
    return
  }

  // 检查 token
  const token = request.cookies.get('token')?.value
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const role = (payload as Record<string, unknown>).role as string || 'receptionist'

    // 管理员专属路径
    if (ADMIN_ONLY_PATHS.some(p => pathname.startsWith(p)) && role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: '无权限：仅管理员可操作' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 前台角色限制：禁止访问医生+专属功能页面
    if (role === 'receptionist') {
      // 页面级：禁止访问财务、分析、用户、设置页面
      const blockedPages = ['/finance', '/analytics']
      if (blockedPages.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      // API 级：前台禁止 POST/PUT/DELETE 非预约/提醒的 API
      const method = request.method
      if (method !== 'GET' && DOCTOR_PLUS_API.some(p => pathname.startsWith(p))) {
        return NextResponse.json({ error: '无权限：前台人员不能执行此操作' }, { status: 403 })
      }
      // 前台禁止删除
      if (method === 'DELETE' && pathname.startsWith('/api/patients')) {
        return NextResponse.json({ error: '无权限：仅管理员可删除患者' }, { status: 403 })
      }
    }

    // 医生角色限制：不能删除患者
    if (role === 'doctor') {
      if (request.method === 'DELETE' && pathname.startsWith('/api/patients')) {
        return NextResponse.json({ error: '无权限：仅管理员可删除患者' }, { status: 403 })
      }
    }
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 })
    }
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.set('token', '', { maxAge: 0, path: '/' })
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
