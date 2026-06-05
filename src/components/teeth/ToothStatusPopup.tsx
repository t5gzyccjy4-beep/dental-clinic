'use client'

import { useState } from 'react'
import { TOOTH_STATUSES, getToothStatusColor, getDisplayNumber } from '@/lib/tooth-constants'

interface ToothStatusPopupProps {
  toothNumber: string
  toothName: string
  currentStatus: string
  currentNote: string
  onSave: (toothNumber: string, status: string, note: string) => void
  onClose: () => void
}

export default function ToothStatusPopup({
  toothNumber, toothName, currentStatus, currentNote, onSave, onClose
}: ToothStatusPopupProps) {
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState(currentNote)
  const displayNum = getDisplayNumber(toothNumber)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          #{displayNum} {toothName}
        </h3>
        <p className="text-xs text-gray-400 mb-1">FDI: {toothNumber}</p>

        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-gray-700">牙齿状态</label>
          <div className="grid grid-cols-2 gap-2">
            {TOOTH_STATUSES.map(s => {
              const colors = getToothStatusColor(s.key)
              const isSelected = status === s.key
              return (
                <button
                  key={s.key}
                  onClick={() => setStatus(s.key)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="w-4 h-4 rounded-sm border" style={{ backgroundColor: colors.fill, borderColor: colors.border }} />
                  <span className="text-sm font-medium">{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">备注</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
            placeholder="可选：补充说明..."
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            取消
          </button>
          <button
            onClick={() => onSave(toothNumber, status, note)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
