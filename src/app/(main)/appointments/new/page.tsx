'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Search } from 'lucide-react'
import { getToday } from '@/lib/utils'

function NewAppointmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [patients, setPatients] = useState<Array<{ id: number; name: string; phone: string | null }>>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [form, setForm] = useState({
    patientId: searchParams.get('patientId') || '',
    date: getToday(),
    time: '09:00',
    type: '初诊',
    doctor: '张医生',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (searchTerm.trim().length >= 1) {
      fetch('/api/patients?search=' + encodeURIComponent(searchTerm) + '&limit=10')
        .then(res => res.json())
        .then(data => setPatients(data.patients))
    }
  }, [searchTerm])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.patientId) return
    setSaving(true)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, patientId: parseInt(form.patientId) }),
    })
    if (res.ok) router.push('/appointments')
    else setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/appointments" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">创建预约</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">搜索患者</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="搜索姓名或手机号..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {patients.length > 0 && (
            <div className="mt-2 border rounded-lg divide-y max-h-40 overflow-y-auto">
              {patients.map(p => (
                <button
                  key={p.id} type="button"
                  onClick={() => { setForm(prev => ({ ...prev, patientId: String(p.id) })); setSearchTerm(p.name) }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${form.patientId === String(p.id) ? 'bg-blue-50' : ''}`}
                >
                  {p.name} - {p.phone || '无手机号'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">日期</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">时间</label>
            <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">类型</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="初诊">初诊</option>
              <option value="复诊">复诊</option>
              <option value="治疗">治疗</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">医生</label>
            <input type="text" value={form.doctor} onChange={e => setForm(p => ({ ...p, doctor: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">备注</label>
            <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/appointments" className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</Link>
          <button type="submit" disabled={saving || !form.patientId}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? '保存中...' : '创建预约'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">加载中...</div>}>
      <NewAppointmentForm />
    </Suspense>
  )
}
