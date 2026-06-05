import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'
import { PrismaClient } from '@/generated/prisma/client'

const databaseUrl = process.env['DATABASE_URL']

if (!databaseUrl) {
  throw new Error('DATABASE_URL 环境变量未设置。')
}

const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaNeon(pool)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = prisma
