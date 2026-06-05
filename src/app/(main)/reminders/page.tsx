'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Check, Edit, Save, X } from 'lucide-react'
import { getToday } from '@/lib/utils'

interface ReminderData {
  id: number
  patientId: number
  type: string
  remindDate: string
  status: string
  message: string | null
  patient: { name: string }
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderData[]>([])
  const [type, setType] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ remindDate:'', type:'复诊', message:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadReminders() }, [type])

  async function loadReminders() {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    const res = await fetch('/api/reminders?' + params)
    const data = await res.json()
    setReminders(data.reminders)
  }

  async function markDone(id: number) {
    await fetch(`/api/reminders`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: '已提醒' }),
    })
    loadReminders()
  }

  function startEdit(r: ReminderData) {
    setEditingId(r.id)
    setEditForm({ remindDate: r.remindDate, type: r.type, message: r.message || '' })
  }

  async function saveEdit() {
    if (!editingId) return
    setSaving(true)
    await fetch('/api/reminders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, ...editForm }),
    })
    setEditingId(null)
    setSaving(false)
    loadReminders()
  }

  const today = getToday()
  const urgentCount = reminders.filter(r => r.remindDate <= today && r.status === '待提醒').length

  const typeColors: Record<string, string> = {
    '复诊': 'bg-blue-100 text-blue-700',
    '预约': 'bg-green-100 text-green-700',
    '欠费': 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">提醒中心</h1>
          {urgentCount > 0 && (
            <p className="text-sm text-red-500 mt-1">{urgentCount} 条过期提醒待处理</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select value={type} onChange={e => setType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">全部类型</option>
          <option value="复诊">复诊</option>
          <option value="预约">预约</option>
          <option value="欠费">欠费</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border">
        {reminders.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400">
            <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>暂无提醒</p>
          </div>
        ) : (
          <div className="divide-y">
            {reminders.map(r => (
              <div key={r.id} className={`${r.remindDate <= today && r.status === '待提醒' ? 'bg-red-50' : ''}`}>
                {editingId === r.id ? (
                  <div className="px-5 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-gray-500">提醒日期</label>
                        <input type="date" value={editForm.remindDate} onChange={e => setEditForm(p => ({...p, remindDate: e.target.value}))} className="w-full px-3 py-1.5 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">类型</label>
                        <select value={editForm.type} onChange={e => setEditForm(p => ({...p, type: e.target.value}))} className="w-full px-3 py-1.5 border rounded text-sm">
                          <option value="复诊">复诊</option>
                          <option value="预约">预约</option>
                          <option value="欠费">欠费</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-500">消息</label>
                        <input value={editForm.message} onChange={e => setEditForm(p => ({...p, message: e.target.value}))} placeholder="提醒消息内容" className="w-full px-3 py-1.5 border rounded text-sm" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg"><X className="w-3.5 h-3.5" />取消</button>
                      <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50"><Save className="w-3.5 h-3.5" />{saving ? '保存中...' : '保存'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Bell className={`w-5 h-5 ${r.remindDate <= today && r.status === '待提醒' ? 'text-red-500' : 'text-gray-400'}`} />
                      <div>
                        <Link href={`/patients/${r.patientId}`} className="text-sm font-medium text-blue-600 hover:underline">
                          {r.patient.name}
                        </Link>
                        <p className="text-xs text-gray-500">{r.message || `${r.type}提醒`} · 日期: {r.remindDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[r.type] || 'bg-gray-100'}`}>{r.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === '待提醒' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                        {r.status}
                      </span>
                      {r.status === '待提醒' && (
                        <>
                          <button onClick={() => startEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="编辑">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => markDone(r.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="标记已完成">
                            <Check className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
