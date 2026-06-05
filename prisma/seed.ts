import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { createHash } from 'crypto'

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

async function main() {
  console.log('🌱 开始填充测试数据...')

  // 1. 创建默认用户
  const adminPassword = hashPassword('admin123')
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      role: 'admin',
      name: '系统管理员',
    },
  })

  const doctorPassword = hashPassword('doctor123')
  await prisma.user.upsert({
    where: { username: 'doctor' },
    update: {},
    create: {
      username: 'doctor',
      passwordHash: doctorPassword,
      role: 'doctor',
      name: '张医生',
    },
  })

  const receptionPassword = hashPassword('reception123')
  await prisma.user.upsert({
    where: { username: 'reception' },
    update: {},
    create: {
      username: 'reception',
      passwordHash: receptionPassword,
      role: 'receptionist',
      name: '李前台',
    },
  })
  console.log('✅ 用户创建完成')

  // 2. 创建设置
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      clinicName: '康美口腔门诊部',
      address: '北京市朝阳区建国路88号',
      phone: '010-88886666',
      defaultReminderDays: '[3,1,0]',
    },
  })
  console.log('✅ 门诊设置完成')

  // 3. 创建治疗项目库
  const treatmentItems = [
    { name: '口腔检查', category: '检查', defaultPrice: 50, unit: '次' },
    { name: '洗牙（超声波洁牙）', category: '牙周', defaultPrice: 200, unit: '次' },
    { name: '补牙（树脂填充）', category: '口腔内科', defaultPrice: 300, unit: '颗' },
    { name: '根管治疗', category: '口腔内科', defaultPrice: 1200, unit: '颗' },
    { name: '拔牙（简单）', category: '口腔外科', defaultPrice: 200, unit: '颗' },
    { name: '拔牙（智齿）', category: '口腔外科', defaultPrice: 800, unit: '颗' },
    { name: '全瓷冠', category: '修复', defaultPrice: 2500, unit: '颗' },
    { name: '烤瓷牙', category: '修复', defaultPrice: 1500, unit: '颗' },
    { name: '种植牙', category: '种植', defaultPrice: 8000, unit: '颗' },
    { name: '牙齿矫正（金属托槽）', category: '正畸', defaultPrice: 15000, unit: '套' },
    { name: '牙齿矫正（隐形）', category: '正畸', defaultPrice: 30000, unit: '套' },
    { name: '牙齿美白', category: '修复', defaultPrice: 1500, unit: '次' },
    { name: '牙周治疗', category: '牙周', defaultPrice: 500, unit: '次' },
    { name: '窝沟封闭', category: '预防', defaultPrice: 100, unit: '颗' },
    { name: '涂氟', category: '预防', defaultPrice: 80, unit: '次' },
  ]

  for (const item of treatmentItems) {
    await prisma.treatmentItem.create({ data: item })
  }
  console.log('✅ 治疗项目创建完成')

  // 4. 创建示例患者
  const patients = [
    { name: '王小明', gender: '男', birthday: '1990-05-15', phone: '13800138001', wechat: 'wx_wangxm', address: '朝阳区阳光花园3号楼', allergies: '青霉素', medicalHistory: '高血压', notes: '老患者' },
    { name: '李芳', gender: '女', birthday: '1985-09-20', phone: '13800138002', address: '海淀区中关村大街10号', allergies: '', medicalHistory: '', notes: '' },
    { name: '张伟', gender: '男', birthday: '1978-12-01', phone: '13800138003', address: '东城区王府井大街5号', allergies: '头孢类', medicalHistory: '糖尿病', notes: '' },
    { name: '赵丽丽', gender: '女', birthday: '1995-03-25', phone: '13800138004', wechat: 'zhaolili', address: '西城区金融街15号', allergies: '', medicalHistory: '', notes: '' },
    { name: '刘强', gender: '男', birthday: '1982-07-10', phone: '13800138005', address: '朝阳区望京SOHO 12层', allergies: '', medicalHistory: '乙肝携带者', notes: '' },
    { name: '陈晓红', gender: '女', birthday: '1992-11-08', phone: '13800138006', address: '丰台区南三环西路28号', allergies: '磺胺类', medicalHistory: '', notes: '' },
    { name: '周明', gender: '男', birthday: '1970-04-30', phone: '13800138007', address: '海淀区学院路15号', allergies: '', medicalHistory: '冠心病', notes: 'VIP患者' },
    { name: '吴娜', gender: '女', birthday: '1998-08-18', phone: '13800138008', address: '大兴区亦庄经济开发区', allergies: '', medicalHistory: '', notes: '' },
  ]

  for (const p of patients) {
    await prisma.patient.create({ data: p })
  }
  console.log('✅ 患者创建完成')

  // 5. 创建预约
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const appointments = [
    { patientId: 1, date: todayStr, time: '09:00', type: '复诊', status: '已到诊', doctor: '张医生' },
    { patientId: 2, date: todayStr, time: '09:30', type: '初诊', status: '已到诊', doctor: '张医生' },
    { patientId: 3, date: todayStr, time: '10:00', type: '复诊', status: '已预约', doctor: '张医生' },
    { patientId: 4, date: todayStr, time: '11:00', type: '治疗', status: '已预约', doctor: '张医生' },
    { patientId: 5, date: todayStr, time: '14:00', type: '初诊', status: '已预约', doctor: '张医生' },
    { patientId: 6, date: todayStr, time: '15:30', type: '复诊', status: '已预约', doctor: '张医生' },
  ]

  for (const a of appointments) {
    await prisma.appointment.create({ data: a })
  }
  console.log('✅ 预约创建完成')

  // 6. 创建病历
  await prisma.medicalRecord.create({
    data: {
      patientId: 1,
      appointmentId: 1,
      chiefComplaint: '右下后牙疼痛一周',
      presentIllness: '患者一周前开始右下后牙自发痛，冷热刺激加重，夜间痛明显',
      pastHistory: '既往有补牙史',
      examination: '46号牙远中邻面深龋，探痛(+)，叩痛(±)，冷诊(+)，牙龈无明显红肿',
      diagnosis: '46号牙急性牙髓炎',
      treatmentPlan: '46号牙根管治疗+全瓷冠修复',
      doctorNotes: '分次完成根管治疗，约2-3次复诊',
      type: '初诊',
    },
  })
  console.log('✅ 病历创建完成')

  // 7. 创建牙位记录
  await prisma.toothRecord.create({ data: { patientId: 1, recordId: 1, toothNumber: '46', status: '龋齿', note: '急性牙髓炎' } })
  await prisma.toothRecord.create({ data: { patientId: 1, recordId: 1, toothNumber: '36', status: '填充', note: '已补' } })
  await prisma.toothRecord.create({ data: { patientId: 1, recordId: 1, toothNumber: '18', status: '缺失', note: '已拔除' } })
  console.log('✅ 牙位记录创建完成')

  // 8. 创建治疗
  await prisma.treatment.create({
    data: {
      patientId: 1,
      recordId: 1,
      items: JSON.stringify([
        { treatmentItemId: 4, name: '根管治疗', price: 1200, toothNumber: '46', quantity: 1 },
        { treatmentItemId: 7, name: '全瓷冠', price: 2500, toothNumber: '46', quantity: 1 },
      ]),
      status: '进行中',
      startDate: todayStr,
    },
  })
  console.log('✅ 治疗创建完成')

  // 9. 创建账单
  await prisma.bill.create({
    data: { patientId: 1, treatmentId: 1, totalAmount: 3700, paidAmount: 2000, balance: 1700, status: '未结清' },
  })
  await prisma.payment.create({ data: { billId: 1, amount: 2000, method: '微信' } })
  console.log('✅ 账单和支付创建完成')

  // 10. 创建提醒
  await prisma.reminder.create({
    data: {
      patientId: 1,
      appointmentId: 1,
      type: '复诊',
      remindDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
      status: '待提醒',
      message: '王小明需在7天后复诊进行根管治疗第二次',
    },
  })
  console.log('✅ 提醒创建完成')

  console.log('🎉 测试数据填充完成！')
  console.log('默认账号: admin / admin123')
  console.log('医生账号: doctor / doctor123')
  console.log('前台账号: reception / reception123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
