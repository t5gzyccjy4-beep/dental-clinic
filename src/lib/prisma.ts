import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/generated/prisma/client'

const databaseUrl = process.env['DATABASE_URL']

if (!databaseUrl) {
  throw new Error('DATABASE_URL 环境变量未设置。请在 .env 中配置数据库连接地址。')
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { neon } = require('@neondatabase/serverless')
const sql = neon(databaseUrl)
const adapter = new PrismaNeon(sql, {})

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = prisma
