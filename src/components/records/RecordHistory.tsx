'use client'

import { useState } from 'react'
import { formatDateTime } from '@/lib/utils'
import { FileText, Plus, ChevronDown, ChevronUp, X, Edit, Save } from 'lucide-react'

interface MedicalRecordFull {
  id: number
  chiefComplaint: string | null
  presentIllness: string | null
  pastHistory: string | null
  examination: string | null
  diagnosis: string | null
  treatmentPlan: string | null
  doctorNotes: string | null
  type: string
  createdAt: string
}

interface RecordHistoryProps {
  patientId: number
  records: MedicalRecordFull[]
  onNewRecord: () => void
}

export default function RecordHistory({ patientId, records, onNewRecord }: RecordHistoryProps) {
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<MedicalRecordFull | null>(null)
  const [form, setForm] = useState({
    chiefComplaint: '', presentIllness: '', pastHistory: '',
    examination: '', diagnosis: '', treatmentPlan: '', doctorNotes: '', type: '初诊'
  })

  async function handleSubmitNew(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, ...form }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ chiefComplaint: '', presentIllness: '', pastHistory: '', examination: '', diagnosis: '', treatmentPlan: '', doctorNotes: '', type: '初诊' })
      onNewRecord()
    }
    setSaving(false)
  }

  function startEdit(r: MedicalRecordFull) {
    setEditingId(r.id)
    setEditForm({ ...r })
  }

  async function saveEdit() {
    if (!editForm) return
    setSaving(true)
    const res = await fetch(`/api/records/${editForm.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      setEditingId(null)
      setEditForm(null)
      onNewRecord()
    }
    setSaving(false)
  }

  function updateEdit(field: string, value: string) {
    if (!editForm) return
    setEditForm({ ...editForm, [field]: value })
  }

  const renderEditForm = () => {
    if (!editForm) return null
    const f = editForm
    return (
      <div className="border border-amber-200 bg-amber-50/30 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">编辑病历 #{f.id}</h4>
          <button onClick={() => setEditingId(null)}><X className="w-4 h-4" /></button>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">病历类型</label>
          <select value={f.type} onChange={e => updateEdit('type', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm">
            <option value="初诊">初诊</option>
            <option value="复诊">复诊</option>
          </select>
        </div>
        <div><label className="text-sm font-medium text-gray-700">主诉</label><textarea value={f.chiefComplaint||''} onChange={e => updateEdit('chiefComplaint', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-gray-700">现病史</label><textarea value={f.presentIllness||''} onChange={e => updateEdit('presentIllness', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
          <div><label className="text-sm font-medium text-gray-700">既往史</label><textarea value={f.pastHistory||''} onChange={e => updateEdit('pastHistory', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
        </div>
        <div><label className="text-sm font-medium text-gray-700">检查</label><textarea value={f.examination||''} onChange={e => updateEdit('examination', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
        <div><label className="text-sm font-medium text-gray-700">诊断</label><textarea value={f.diagnosis||''} onChange={e => updateEdit('diagnosis', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
        <div><label className="text-sm font-medium text-gray-700">治疗方案</label><textarea value={f.treatmentPlan||''} onChange={e => updateEdit('treatmentPlan', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
        <div><label className="text-sm font-medium text-gray-700">医嘱</label><textarea value={f.doctorNotes||''} onChange={e => updateEdit('doctorNotes', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm border rounded-lg">取消</button>
          <button onClick={saveEdit} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50"><Save className="w-4 h-4" />{saving?'保存中...':'保存修改'}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">病历记录</h3>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="w-4 h-4" />新建病历
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmitNew} className="border border-blue-200 bg-blue-50/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between"><h4 className="font-medium">新建病历</h4><button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></button></div>
          <div><label className="text-sm font-medium text-gray-700">病历类型</label><select value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"><option value="初诊">初诊</option><option value="复诊">复诊</option></select></div>
          <div><label className="text-sm font-medium text-gray-700">主诉</label><textarea value={form.chiefComplaint} onChange={e => setForm(p=>({...p,chiefComplaint:e.target.value}))} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700">现病史</label><textarea value={form.presentIllness} onChange={e => setForm(p=>({...p,presentIllness:e.target.value}))} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
            <div><label className="text-sm font-medium text-gray-700">既往史</label><textarea value={form.pastHistory} onChange={e => setForm(p=>({...p,pastHistory:e.target.value}))} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
          </div>
          <div><label className="text-sm font-medium text-gray-700">检查</label><textarea value={form.examination} onChange={e => setForm(p=>({...p,examination:e.target.value}))} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
          <div><label className="text-sm font-medium text-gray-700">诊断</label><textarea value={form.diagnosis} onChange={e => setForm(p=>({...p,diagnosis:e.target.value}))} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
          <div><label className="text-sm font-medium text-gray-700">治疗方案</label><textarea value={form.treatmentPlan} onChange={e => setForm(p=>({...p,treatmentPlan:e.target.value}))} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
          <div><label className="text-sm font-medium text-gray-700">医嘱</label><textarea value={form.doctorNotes} onChange={e => setForm(p=>({...p,doctorNotes:e.target.value}))} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded-lg">取消</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50">{saving?'保存中...':'保存病历'}</button></div>
        </form>
      )}

      {records.length === 0 ? (
        <p className="text-gray-400 py-4">暂无病历记录</p>
      ) : (
        <div className="space-y-3">
          {records.map(r => (
            <div key={r.id}>
              {editingId === r.id ? renderEditForm() : (
                <>
                  <div onClick={() => setExpandedId(expandedId===r.id ? null : r.id)} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">{r.type}</span>
                        <span className="text-xs text-gray-400">{formatDateTime(r.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={e => { e.stopPropagation(); startEdit(r) }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="编辑"><Edit className="w-3.5 h-3.5" /></button>
                        {expandedId===r.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                    {r.chiefComplaint && <p className="text-sm text-gray-600"><strong>主诉：</strong>{r.chiefComplaint}</p>}
                    {r.diagnosis && <p className="text-sm text-gray-600"><strong>诊断：</strong>{r.diagnosis}</p>}
                    {expandedId !== r.id && <p className="text-xs text-blue-500 mt-1">点击查看详情</p>}
                  </div>
                  {expandedId === r.id && (
                    <div className="border border-blue-200 bg-blue-50/20 rounded-b-lg -mt-px p-5 space-y-3">
                      <DetailRow label="主诉" value={r.chiefComplaint} />
                      <DetailRow label="现病史" value={r.presentIllness} />
                      <DetailRow label="既往史" value={r.pastHistory} />
                      <DetailRow label="检查" value={r.examination} />
                      <DetailRow label="诊断" value={r.diagnosis} />
                      <DetailRow label="治疗方案" value={r.treatmentPlan} />
                      <DetailRow label="医嘱" value={r.doctorNotes} />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return <div><span className="text-xs font-medium text-gray-500">{label}</span><p className="text-sm text-gray-700 mt-0.5">{value}</p></div>
}
