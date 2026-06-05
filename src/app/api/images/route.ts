import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  const patientId = request.nextUrl.searchParams.get('patientId')

  const where: Record<string, unknown> = {}
  if (patientId) where.patientId = parseInt(patientId)

  const images = await prisma.image.findMany({
    where,
    include: { patient: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ images })
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const patientId = formData.get('patientId') as string
  const type = formData.get('type') as string || '口内照'
  const note = formData.get('note') as string || ''
  const toothNumber = formData.get('toothNumber') as string || ''
  const recordId = formData.get('recordId') as string || ''

  if (!file || !patientId) {
    return NextResponse.json({ error: '缺少文件或患者ID' }, { status: 400 })
  }

  // 保存文件
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${patientId}_${Date.now()}.${ext}`
  const filePath = join(uploadDir, filename)
  await writeFile(filePath, buffer)

  const image = await prisma.image.create({
    data: {
      patientId: parseInt(patientId),
      recordId: recordId ? parseInt(recordId) : null,
      filePath: `/uploads/${filename}`,
      type,
      note: note || null,
      toothNumber: toothNumber || null,
    },
  })

  return NextResponse.json({ image }, { status: 201 })
}
