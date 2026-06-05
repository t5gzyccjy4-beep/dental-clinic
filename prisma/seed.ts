import { createHash } from 'crypto'

const databaseUrl = process.env['DATABASE_URL']

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

async function main() {
  let prisma: any

  if (databaseUrl && databaseUrl.startsWith('postgres')) {
    // 使用 pg 驱动进行种子数据操作（绕过 Neon serverless 适配器兼容问题）
    const { Pool } = await import('pg')
    const pg = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })

    // 直接使用 SQL 插入数据
    async function run(sql: string, params?: any[]) {
      return pg.query(sql, params)
    }

    console.log('✅ 已连接 Neon PostgreSQL')
    console.log('🌱 开始填充测试数据...')

    // 创建用户
    const passwordHash = hashPassword('admin123')
    const drHash = hashPassword('doctor123')
    const recHash = hashPassword('reception123')

    await run(`INSERT INTO users (username, password_hash, name, role, created_at, updated_at)
      VALUES ($1,$2,$3,$4,NOW(),NOW()) ON CONFLICT (username) DO NOTHING`,
      ['admin', passwordHash, '管理员', 'admin'])
    await run(`INSERT INTO users (username, password_hash, name, role, created_at, updated_at)
      VALUES ($1,$2,$3,$4,NOW(),NOW()) ON CONFLICT (username) DO NOTHING`,
      ['doctor', drHash, '张医生', 'doctor'])
    await run(`INSERT INTO users (username, password_hash, name, role, created_at, updated_at)
      VALUES ($1,$2,$3,$4,NOW(),NOW()) ON CONFLICT (username) DO NOTHING`,
      ['reception', recHash, '李前台', 'receptionist'])
    console.log('✅ 用户创建完成')

    // 创建治疗项目
    const items = [
      ['口腔检查', '诊断', 50, '次'],
      ['全口洁牙', '牙周', 300, '次'],
      ['补牙(树脂)', '修复', 350, '颗'],
      ['根管治疗', '牙体牙髓', 1200, '颗'],
      ['拔牙(普通)', '口腔颌面外科', 200, '颗'],
      ['拔牙(智齿)', '口腔颌面外科', 800, '颗'],
      ['烤瓷牙冠', '修复', 1500, '颗'],
      ['全瓷牙冠', '修复', 2500, '颗'],
      ['种植牙(单颗)', '种植', 8000, '颗'],
      ['牙齿美白', '美容', 600, '次'],
      ['正畸初诊', '正畸', 200, '次'],
      ['窝沟封闭', '预防', 100, '颗'],
      ['涂氟', '预防', 80, '次'],
      ['牙周刮治', '牙周', 500, '次'],
      ['X光片', '诊断', 80, '张'],
    ]
    const countRes = await run('SELECT COUNT(*)::int as c FROM treatment_items')
    if (parseInt(countRes.rows[0]?.c || '0') === 0) {
      for (const [name, cat, price, unit] of items) {
        await run(
          `INSERT INTO treatment_items (name, category, default_price, unit, created_at, updated_at) VALUES ($1,$2,$3,$4,NOW(),NOW())`,
          [name, cat, price, unit]
        )
      }
      console.log('✅ 治疗项目创建完成')
    } else {
      console.log('⚠️ 治疗项目已存在，跳过')
    }

    // 创建门诊设置
    const sc = await run('SELECT COUNT(*)::int as c FROM settings')
    if (parseInt(sc.rows[0]?.c || '0') === 0) {
      await run(`INSERT INTO settings (clinic_name, address, phone, default_reminder_days, updated_at) VALUES ($1,$2,$3,$4,NOW())`,
        ['康美口腔门诊部', '北京市朝阳区XX路88号', '010-88886666', '[3,1,0]'])
      console.log('✅ 门诊设置创建完成')
    } else {
      console.log('⚠️ 门诊设置已存在，跳过')
    }

    await pg.end()
    console.log('🎉 数据填充完成！')
    console.log('默认账号: admin / admin123')
    console.log('医生账号: doctor / doctor123')
    console.log('前台账号: reception / reception123')
    return
  }

  // 本地 SQLite
  const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3')
  const { PrismaClient: PC } = await import('../src/generated/prisma/client.js')
  const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
  prisma = new PC({ adapter } as any)
  console.log('✅ 已连接本地 SQLite')

  // ... SQLite seed logic would go here but we're focused on Neon now
  console.log('⚠️ SQLite seed skipped - use Neon for production')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => process.exit(0))
