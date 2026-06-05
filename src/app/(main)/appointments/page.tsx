'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Plus, Clock, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Edit, Save, User } from 'lucide-react'
import { getToday } from '@/lib/utils'

interface AppointmentData {
  id: number; patientId: number; date: string; time: string; type: string; status: string
  doctor: string | null; notes: string | null
  patient: { name: string; phone: string }
}

function AppointmentsContent() {
  const searchParams = useSearchParams()
  const urlDate = searchParams.get('date')

  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [date, setDate] = useState(urlDate || getToday())
  const [view, setView] = useState<'day'|'week'>('day')
  const [expandedId, setExpandedId] = useState<number|null>(null)
  const [editingId, setEditingId] = useState<number|null>(null)
  const [editForm, setEditForm] = useState({date:'',time:'',type:'初诊',doctor:'',notes:''})

  useEffect(() => { loadAppointments() }, [date, view])

  async function loadAppointments() {
    const params = new URLSearchParams()
    if (view === 'day') {
      params.set('date', date)
    } else {
      // 周视图：以当前日期为起始，查7天
      params.set('range', 'week')
      params.set('startDate', date)
    }
    const res = await fetch('/api/appointments?' + params)
    const data = await res.json()
    setAppointments(data.appointments)
  }

  function changeDate(days: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    setDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
  }

  function changeWeek(weeks: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + weeks * 7)
    setDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
  }

  function getWeekEnd(): string {
    const d = new Date(date)
    d.setDate(d.getDate() + 6)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  function switchView(v: 'day'|'week') {
    setView(v)
    setExpandedId(null)
    setEditingId(null)
  }

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/appointments/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status}) })
    loadAppointments()
  }

  function startEdit(a: AppointmentData) {
    setEditingId(a.id)
    setEditForm({date:a.date,time:a.time,type:a.type,doctor:a.doctor||'',notes:a.notes||''})
  }

  async function saveEdit() {
    if (!editingId) return
    await fetch(`/api/appointments/${editingId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(editForm) })
    setEditingId(null)
    loadAppointments()
  }

  const statusColors: Record<string,string> = {'已预约':'bg-blue-100 text-blue-700','已到诊':'bg-green-100 text-green-700','已取消':'bg-gray-100 text-gray-500','已过期':'bg-red-100 text-red-500'}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">预约中心</h1>
        <Link href="/appointments/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4"/>创建预约</Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
          <button onClick={() => view === 'day' ? changeDate(-1) : changeWeek(-1)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4"/></button>
          <span className="text-sm font-medium px-3 whitespace-nowrap">
            {view === 'day' ? date : `${date} ~ ${getWeekEnd()}`}
          </span>
          <button onClick={() => view === 'day' ? changeDate(1) : changeWeek(1)} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-4 h-4"/></button>
        </div>
        <button onClick={() => setDate(getToday())} className="text-sm text-blue-600 hover:underline">今天</button>
        <div className="flex ml-auto border rounded-lg overflow-hidden">
          <button onClick={() => switchView('day')} className={`px-4 py-2 text-sm ${view==='day'?'bg-blue-600 text-white':'bg-white'}`}>日视图</button>
          <button onClick={() => switchView('week')} className={`px-4 py-2 text-sm ${view==='week'?'bg-blue-600 text-white':'bg-white'}`}>周视图</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {appointments.length===0 ? (
          <div className="px-5 py-12 text-center text-gray-400">
            <p>{view === 'day' ? '该日期暂无预约' : '本周暂无预约'}</p>
          </div>
        ) : (
          <div className="divide-y">
            {appointments.map(a => (
              <div key={a.id}>
                {editingId===a.id ? (
                  <div className="px-5 py-4 bg-amber-50/50">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div><label className="text-xs text-gray-500">日期</label><input type="date" value={editForm.date} onChange={e=>setEditForm(p=>({...p,date:e.target.value}))} className="w-full px-2 py-1.5 border rounded text-sm" /></div>
                      <div><label className="text-xs text-gray-500">时间</label><input type="time" value={editForm.time} onChange={e=>setEditForm(p=>({...p,time:e.target.value}))} className="w-full px-2 py-1.5 border rounded text-sm" /></div>
                      <div><label className="text-xs text-gray-500">类型</label><select value={editForm.type} onChange={e=>setEditForm(p=>({...p,type:e.target.value}))} className="w-full px-2 py-1.5 border rounded text-sm"><option value="初诊">初诊</option><option value="复诊">复诊</option><option value="治疗">治疗</option></select></div>
                      <div><label className="text-xs text-gray-500">医生</label><input value={editForm.doctor} onChange={e=>setEditForm(p=>({...p,doctor:e.target.value}))} className="w-full px-2 py-1.5 border rounded text-sm" /></div>
                      <div><label className="text-xs text-gray-500">备注</label><input value={editForm.notes} onChange={e=>setEditForm(p=>({...p,notes:e.target.value}))} className="w-full px-2 py-1.5 border rounded text-sm" /></div>
                    </div>
                    <div className="flex justify-end gap-2 mt-3"><button onClick={()=>setEditingId(null)} className="px-3 py-1.5 text-sm border rounded-lg">取消</button><button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg"><Save className="w-3.5 h-3.5"/>保存</button></div>
                  </div>
                ) : (
                  <div>
                    <div onClick={()=>setExpandedId(expandedId===a.id?null:a.id)} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Clock className="w-4 h-4 text-gray-400"/>
                          <span className="text-sm text-gray-500">{a.date}</span>
                          <span className="text-sm font-medium">{a.time}</span>
                        </div>
                        <div>
                          <Link href={`/patients/${a.patientId}`} onClick={e=>e.stopPropagation()} className="text-sm font-medium text-blue-600 hover:underline">{a.patient.name}</Link>
                          <p className="text-xs text-gray-400">{a.patient.phone} · {a.doctor||'未指定'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{a.type}</span>
                        <select value={a.status} onChange={e=>{e.stopPropagation();updateStatus(a.id,e.target.value)}} onClick={e=>e.stopPropagation()} className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[a.status]||''}`}><option value="已预约">已预约</option><option value="已到诊">已到诊</option><option value="已取消">已取消</option></select>
                        <button onClick={e=>{e.stopPropagation();startEdit(a)}} className="p-1 text-gray-400 hover:text-blue-600" title="编辑"><Edit className="w-3.5 h-3.5"/></button>
                        {expandedId===a.id?<ChevronUp className="w-4 h-4 text-gray-400"/>:<ChevronDown className="w-4 h-4 text-gray-400"/>}
                      </div>
                    </div>
                    {expandedId===a.id && (
                      <div className="px-5 py-4 bg-gray-50 border-t space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-gray-500">日期：</span><span className="font-medium">{a.date}</span></div>
                          <div><span className="text-gray-500">时间：</span><span className="font-medium">{a.time}</span></div>
                          <div><span className="text-gray-500">类型：</span><span className="font-medium">{a.type}</span></div>
                          <div><span className="text-gray-500">医生：</span><span className="font-medium">{a.doctor||'未指定'}</span></div>
                        </div>
                        {a.notes && <div><span className="text-sm text-gray-500">备注：</span><p className="text-sm text-gray-700 mt-1 p-3 bg-white rounded border">{a.notes}</p></div>}
                        <div className="flex gap-2">
                          <Link href={`/patients/${a.patientId}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><User className="w-3 h-3"/>查看患者档案</Link>
                        </div>
                      </div>
                    )}
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

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-gray-400">加载中...</div>}>
      <AppointmentsContent />
    </Suspense>
  )
}
