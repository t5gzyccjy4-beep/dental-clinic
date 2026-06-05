import { PrismaClient } from '@/generated/prisma/client'

const databaseUrl = process.env['DATABASE_URL']

let adapter: any

if (databaseUrl && databaseUrl.startsWith('postgres')) {
  // Vercel / Neon 云数据库
  const { PrismaNeon } = require('@prisma/adapter-neon') as typeof import('@prisma/adapter-neon')
  adapter = new PrismaNeon({ connectionString: databaseUrl })
} else {
  // 本地 SQLite
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3') as typeof import('@prisma/adapter-better-sqlite3')
  adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = prisma
