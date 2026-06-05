import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env['JWT_SECRET'] || 'dental-clinic-secret-key-change-in-production'
)

export interface UserPayload {
  id: number
  username: string
  role: string
  name: string
}

export async function createToken(user: UserPayload): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}

// 权限等级：admin > doctor > receptionist
const ROLE_LEVEL: Record<string, number> = {
  admin: 3,
  doctor: 2,
  receptionist: 1,
}

/**
 * 检查用户是否拥有足够权限
 * @param user 用户 session
 * @param requiredRole 最低所需角色
 */
export function hasPermission(user: UserPayload | null, requiredRole: string): boolean {
  if (!user) return false
  return (ROLE_LEVEL[user.role] || 0) >= (ROLE_LEVEL[requiredRole] || 0)
}

/**
 * 权限定义：
 * - admin: 所有操作
 * - doctor: 除用户管理、系统设置外的所有操作
 * - receptionist: 仅预约管理和患者查看
 */

// 可执行写操作的角色（创建/编辑）
export const CAN_WRITE_PATIENTS = ['admin', 'doctor']
export const CAN_WRITE_RECORDS = ['admin', 'doctor']
export const CAN_WRITE_TREATMENTS = ['admin', 'doctor']
export const CAN_WRITE_BILLS = ['admin', 'doctor']
export const CAN_WRITE_IMAGES = ['admin', 'doctor']
export const CAN_MANAGE_APPOINTMENTS = ['admin', 'doctor', 'receptionist']
export const CAN_MANAGE_REMINDERS = ['admin', 'doctor', 'receptionist']
export const CAN_DELETE = ['admin', 'doctor']
export const CAN_DELETE_PATIENTS = ['admin'] // 仅管理员可删除患者
export const CAN_EXPORT = ['admin', 'doctor']
export const CAN_MANAGE_USERS = ['admin']
export const CAN_MANAGE_SETTINGS = ['admin']
export const CAN_BATCH_OPERATE = ['admin']
export const CAN_VIEW_ANALYTICS = ['admin', 'doctor']
export const CAN_VIEW_FINANCE = ['admin', 'doctor']
