'use client'

import { useState } from 'react'
import { ADULT_TEETH, TOOTH_STATUSES, getToothStatusColor, getDisplayNumber, getToothLabel, type ToothInfo } from '@/lib/tooth-constants'
import ToothStatusPopup from './ToothStatusPopup'

interface ToothRecord {
  toothNumber: string
  status: string
  note: string | null
}

interface AdultToothChartProps {
  patientId: number
  toothRecords: ToothRecord[]
  onUpdate: () => void
}

// 上下颌牙齿排列顺序（从患者角度，左右镜像）
const UPPER_ORDER = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28']
const LOWER_ORDER = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38']

export default function AdultToothChart({ patientId, toothRecords, onUpdate }: AdultToothChartProps) {
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null)
  const [childMode, setChildMode] = useState(false)

  const toothMap: Record<string, ToothRecord> = {}
  toothRecords.forEach(tr => {
    toothMap[tr.toothNumber] = tr
  })

  async function handleStatusChange(toothNumber: string, status: string, note: string) {
    await fetch('/api/teeth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, toothNumber, status, note }),
    })
    setSelectedTooth(null)
    onUpdate()
  }

  const selected = toothMap[selectedTooth || '']

  const teethToDraw = childMode
    ? []  // TODO: 儿童牙位图
    : [...UPPER_ORDER, ...LOWER_ORDER]

  const toothInfo = ADULT_TEETH.find(t => t.number === selectedTooth)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={childMode}
            onChange={e => setChildMode(e.target.checked)}
            className="rounded"
          />
          儿童模式（乳牙）
        </label>
        <div className="flex gap-4 text-xs">
          {TOOTH_STATUSES.map(s => (
            <span key={s.key} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm border" style={{ backgroundColor: s.color, borderColor: s.borderColor }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg viewBox="0 0 800 350" className="w-full max-w-3xl mx-auto">
          {/* 上颌标签 */}
          <text x="400" y="25" textAnchor="middle" className="text-sm fill-gray-500" fontSize="14">上颌</text>

          {/* 上颌牙齿 */}
          {UPPER_ORDER.map((num, i) => {
            const record = toothMap[num]
            const x = 50 + i * 44
            const y = 40
            const colors = getToothStatusColor(record?.status || '正常')
            const isSelected = selectedTooth === num

            return (
              <g key={num} onClick={() => setSelectedTooth(num)} className="cursor-pointer">
                <rect
                  x={x} y={y} width={36} height={50} rx={6}
                  fill={colors.fill}
                  stroke={isSelected ? '#2563eb' : colors.border}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <text x={x + 18} y={y + 25} textAnchor="middle" fontSize="12" fill="#333" fontWeight="bold">{getDisplayNumber(num)}</text>
                {record && record.status !== '正常' && (
                  <text x={x + 18} y={y + 42} textAnchor="middle" fontSize="9" fill={colors.border}>{record.status}</text>
                )}
              </g>
            )
          })}

          {/* 分隔线 */}
          <line x1="50" y1="95" x2="750" y2="95" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="6,4" />

          {/* 下颌标签 */}
          <text x="400" y="330" textAnchor="middle" className="text-sm fill-gray-500" fontSize="14">下颌</text>

          {/* 下颌牙齿 */}
          {LOWER_ORDER.map((num, i) => {
            const record = toothMap[num]
            const x = 50 + i * 44
            const y = 115
            const colors = getToothStatusColor(record?.status || '正常')
            const isSelected = selectedTooth === num

            return (
              <g key={num} onClick={() => setSelectedTooth(num)} className="cursor-pointer">
                <rect
                  x={x} y={y} width={36} height={50} rx={6}
                  fill={colors.fill}
                  stroke={isSelected ? '#2563eb' : colors.border}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <text x={x + 18} y={y + 30} textAnchor="middle" fontSize="12" fill="#333" fontWeight="bold">{getDisplayNumber(num)}</text>
                {record && record.status !== '正常' && (
                  <text x={x + 18} y={y + 45} textAnchor="middle" fontSize="9" fill={colors.border}>{record.status}</text>
                )}
              </g>
            )
          })}

          {/* 中线标记 */}
          <line x1="400" y1="30" x2="400" y2="175" stroke="#666" strokeWidth="1" strokeDasharray="4,4" />
        </svg>
      </div>

      {/* 选中牙齿的弹窗 */}
      {selectedTooth && toothInfo && (
        <ToothStatusPopup
          toothNumber={selectedTooth}
          toothName={toothInfo.name}
          currentStatus={selected?.status || '正常'}
          currentNote={selected?.note || ''}
          onSave={handleStatusChange}
          onClose={() => setSelectedTooth(null)}
        />
      )}
    </div>
  )
}
