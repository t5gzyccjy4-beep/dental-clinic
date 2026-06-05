'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Edit, User, ClipboardList, Activity, DollarSign, Image, Calendar, Upload, CreditCard, ChevronDown, ChevronUp, Eye, X, Save, Trash2, Check } from 'lucide-react'
import AdultToothChart from '@/components/teeth/AdultToothChart'
import RecordHistory from '@/components/records/RecordHistory'
import { formatDate, formatMoney } from '@/lib/utils'

interface PatientData {
  id: number; name: string; gender: string; birthday: string | null
  phone: string | null; wechat: string | null; address: string | null
  allergies: string | null; medicalHistory: string | null; notes: string | null
  appointments: Array<{ id: number; date: string; time: string; type: string; status: string; doctor: string | null; notes: string | null }>
  medicalRecords: Array<{ id: number; chiefComplaint: string | null; presentIllness: string | null; pastHistory: string | null; examination: string | null; diagnosis: string | null; treatmentPlan: string | null; doctorNotes: string | null; type: string; createdAt: string }>
  toothRecords: Array<{ id: number; toothNumber: string; status: string; note: string | null }>
  treatments: Array<{ id: number; items: string; status: string; startDate: string; endDate: string | null; notes: string | null }>
  bills: Array<{ id: number; totalAmount: number; paidAmount: number; balance: number; status: string; createdAt: string; payments: Array<{ amount: number; method: string; createdAt: string }> }>
  images: Array<{ id: number; filePath: string; type: string; note: string | null; toothNumber: string | null; createdAt: string }>
  reminders: Array<{ id: number; type: string; remindDate: string; status: string; message: string | null }>
}

const ALL_TABS = [
  { key: 'info', label: '基本资料', icon: User, minRole: 'receptionist' },
  { key: 'teeth', label: '牙位图', icon: Activity, minRole: 'doctor' },
  { key: 'records', label: '病历', icon: ClipboardList, minRole: 'doctor' },
  { key: 'treatment', label: '治疗', icon: Activity, minRole: 'doctor' },
  { key: 'finance', label: '财务', icon: DollarSign, minRole: 'doctor' },
  { key: 'images', label: '影像', icon: Image, minRole: 'doctor' },
  { key: 'appointments', label: '预约/复诊', icon: Calendar, minRole: 'receptionist' },
]

const roleLevel: Record<string, number> = { admin: 3, doctor: 2, receptionist: 1 }

export default function PatientDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [tab, setTab] = useState('info')
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('receptionist')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ name:'',gender:'男',birthday:'',phone:'',wechat:'',address:'',allergies:'',medicalHistory:'',notes:'' })
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    loadPatient()
    fetch('/api/auth').then(r => r.json()).then(d => { if (d.user?.role) setRole(d.user.role) }).catch(() => {})
  }, [id])

  async function loadPatient() {
    setLoading(true)
    const res = await fetch(`/api/patients/${id}`)
    if (res.ok) {
      const data = await res.json()
      setPatient(data.patient)
    }
    setLoading(false)
  }

  function openEditModal() {
    if (!patient) return
    setEditForm({
      name: patient.name, gender: patient.gender,
      birthday: patient.birthday || '', phone: patient.phone || '',
      wechat: patient.wechat || '', address: patient.address || '',
      allergies: patient.allergies || '', medicalHistory: patient.medicalHistory || '',
      notes: patient.notes || '',
    })
    setShowEditModal(true)
  }

  async function savePatientEdit() {
    setSavingEdit(true)
    const res = await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      setShowEditModal(false)
      loadPatient()
    }
    setSavingEdit(false)
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">加载中...</div>
  if (!patient) return <div className="text-center py-20 text-gray-400">患者不存在</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patients" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
          <p className="text-sm text-gray-500">{patient.gender} · {patient.birthday || '生日未知'} · {patient.phone || '无手机号'}</p>
        </div>
        {(role === 'admin' || role === 'doctor') && (
          <button onClick={openEditModal} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Edit className="w-4 h-4" />编辑</button>
        )}
      </div>

      {/* 编辑患者弹窗 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold">编辑患者信息</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700">姓名</label><input value={editForm.name} onChange={e => setEditForm(p => ({...p, name: e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-sm font-medium text-gray-700">性别</label><select value={editForm.gender} onChange={e => setEditForm(p => ({...p, gender: e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"><option value="男">男</option><option value="女">女</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700">出生日期</label><input type="date" value={editForm.birthday} onChange={e => setEditForm(p => ({...p, birthday: e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-sm font-medium text-gray-700">手机号</label><input value={editForm.phone} onChange={e => setEditForm(p => ({...p, phone: e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700">微信</label><input value={editForm.wechat} onChange={e => setEditForm(p => ({...p, wechat: e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-sm font-medium text-gray-700">地址</label><input value={editForm.address} onChange={e => setEditForm(p => ({...p, address: e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>
              <div><label className="text-sm font-medium text-gray-700">过敏史</label><textarea value={editForm.allergies} onChange={e => setEditForm(p => ({...p, allergies: e.target.value}))} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
              <div><label className="text-sm font-medium text-gray-700">既往病史</label><textarea value={editForm.medicalHistory} onChange={e => setEditForm(p => ({...p, medicalHistory: e.target.value}))} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
              <div><label className="text-sm font-medium text-gray-700">备注</label><textarea value={editForm.notes} onChange={e => setEditForm(p => ({...p, notes: e.target.value}))} rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
            </div>
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm border rounded-lg">取消</button>
              <button onClick={savePatientEdit} disabled={savingEdit} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50"><Save className="w-4 h-4" />{savingEdit ? '保存中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 overflow-x-auto">
        {ALL_TABS.filter(t => (roleLevel[role] || 0) >= (roleLevel[t.minRole] || 0)).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab===t.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {tab === 'info' && renderInfo(patient)}
        {tab === 'teeth' && (<div><h3 className="text-lg font-semibold text-gray-800 mb-4">牙位图</h3><AdultToothChart patientId={patient.id} toothRecords={patient.toothRecords} onUpdate={loadPatient} /></div>)}
        {tab === 'records' && <RecordHistory patientId={patient.id} records={patient.medicalRecords} onNewRecord={loadPatient} />}
        {tab === 'treatment' && <TreatmentSection patient={patient} onUpdate={loadPatient} />}
        {tab === 'finance' && <FinanceSection patient={patient} onUpdate={loadPatient} />}
        {tab === 'images' && <ImagesSection patient={patient} onUpdate={loadPatient} />}
        {tab === 'appointments' && <AppointmentsSection patient={patient} onUpdate={loadPatient} />}
      </div>
    </div>
  )
}

// ===================== 基本信息 =====================
function renderInfo(p: PatientData) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h3>
        <dl className="space-y-3">
          {infoRow('姓名', p.name)}{infoRow('性别', p.gender)}{infoRow('出生日期', p.birthday||'-')}{infoRow('手机号', p.phone||'-')}{infoRow('微信', p.wechat||'-')}{infoRow('地址', p.address||'-')}
        </dl>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">健康信息</h3>
        <dl className="space-y-3">
          {infoRow('过敏史', p.allergies||'无')}{infoRow('既往病史', p.medicalHistory||'无')}{infoRow('备注', p.notes||'无')}
        </dl>
      </div>
    </div>
  )
}
function infoRow(label: string, value: string) {
  return <div className="flex"><dt className="w-24 text-sm text-gray-500 flex-shrink-0">{label}</dt><dd className="text-sm text-gray-800">{value}</dd></div>
}

// ===================== 治疗 =====================
function TreatmentSection({ patient, onUpdate }: { patient: PatientData; onUpdate: () => void }) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newItems, setNewItems] = useState<Array<{treatmentItemId:number;name:string;price:number;toothNumber:string;quantity:number}>>([])
  const [saving, setSaving] = useState(false)
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null)
  const [editNotes, setEditNotes] = useState('')

  async function createTreatment() {
    if (newItems.length === 0) return
    setSaving(true)
    const total = newItems.reduce((s,i) => s + i.price * i.quantity, 0)
    const tRes = await fetch('/api/treatments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: patient.id,
        items: JSON.stringify(newItems),
        status: '进行中',
        startDate: new Date().toISOString().split('T')[0],
      }),
    })
    if (tRes.ok) {
      const tData = await tRes.json()
      await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          treatmentId: tData.treatment.id,
          totalAmount: total,
        }),
      })
      setShowAdd(false)
      setNewItems([])
      onUpdate()
    }
    setSaving(false)
  }

  async function toggleStatus(treatmentId: number, currentStatus: string) {
    const newStatus = currentStatus === '已完成' ? '进行中' : '已完成'
    const endDate = newStatus === '已完成' ? new Date().toISOString().split('T')[0] : null
    await fetch(`/api/treatments/${treatmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, endDate }),
    })
    onUpdate()
  }

  async function deleteTreatment(treatmentId: number) {
    if (!confirm('确定要删除这条治疗记录吗？')) return
    await fetch(`/api/treatments/${treatmentId}`, { method: 'DELETE' })
    onUpdate()
  }

  async function saveNotes(treatmentId: number) {
    await fetch(`/api/treatments/${treatmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: editNotes }),
    })
    setEditingNotesId(null)
    onUpdate()
  }

  function addItem() {
    setNewItems([...newItems, { treatmentItemId: 0, name: '', price: 0, toothNumber: '', quantity: 1 }])
  }

  function updateItem(idx: number, field: string, value: string | number) {
    const updated = [...newItems]
    ;(updated[idx] as Record<string,unknown>)[field] = value
    setNewItems(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">治疗记录</h3>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Plus2 /> 新增治疗
        </button>
      </div>

      {/* 新增治疗表单 */}
      {showAdd && (
        <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">新增治疗项目</h4>
            <button onClick={() => {setShowAdd(false); setNewItems([])}}><X className="w-4 h-4" /></button>
          </div>
          {newItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border">
              <input value={item.name} onChange={e => updateItem(idx,'name',e.target.value)} placeholder="项目名称" className="flex-1 px-3 py-1.5 border rounded text-sm" />
              <input value={item.toothNumber||''} onChange={e => updateItem(idx,'toothNumber',e.target.value)} placeholder="牙位号" className="w-20 px-3 py-1.5 border rounded text-sm" />
              <input type="number" value={item.price||''} onChange={e => updateItem(idx,'price',parseFloat(e.target.value)||0)} placeholder="价格" className="w-24 px-3 py-1.5 border rounded text-sm" />
              <input type="number" value={item.quantity||1} onChange={e => updateItem(idx,'quantity',parseInt(e.target.value)||1)} min={1} className="w-16 px-3 py-1.5 border rounded text-sm" />
              <button onClick={() => setNewItems(newItems.filter((_,i)=>i!==idx))} className="text-red-400 text-sm">删除</button>
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={addItem} className="px-3 py-1.5 border rounded-lg text-sm">+ 添加项目</button>
            <button onClick={createTreatment} disabled={saving || newItems.length===0 || newItems.some(i=>!i.name)} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50">{saving?'保存中...':'保存治疗并生成账单'}</button>
          </div>
          {newItems.length > 0 && (
            <p className="text-sm text-gray-600">合计：<strong className="text-blue-600">{formatMoney(newItems.reduce((s,i) => s + i.price * i.quantity, 0))}</strong></p>
          )}
        </div>
      )}

      {patient.treatments.length === 0 ? <p className="text-gray-400 py-4">暂无治疗记录</p> : (
        <div className="space-y-3">
          {patient.treatments.map(t => {
            let items: Array<{name:string;toothNumber?:string;price:number;quantity?:number}> = []
            try { items = JSON.parse(t.items) } catch {}
            const total = items.reduce((s,i) => s + i.price*(i.quantity||1), 0)
            return (
              <div key={t.id}>
                <div onClick={() => setExpandedId(expandedId===t.id?null:t.id)} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">开始: {t.startDate}{t.endDate ? ` ~ ${t.endDate}` : ''}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.status==='已完成'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>{t.status}</span>
                      {expandedId===t.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm"><span>项目数: {items.length}</span><span>总金额: <strong>{formatMoney(total)}</strong></span></div>
                  {t.notes && <p className="text-xs text-gray-500 mt-1 truncate">备注: {t.notes}</p>}
                  {expandedId!==t.id && <p className="text-xs text-blue-500 mt-1">点击查看详情</p>}
                </div>
                {expandedId===t.id && (
                  <div className="border border-blue-200 bg-blue-50/20 rounded-b-lg -mt-px p-5 space-y-4">
                    {/* 项目明细表格 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">治疗项目明细</h4>
                      <table className="w-full text-sm">
                        <thead><tr className="border-b"><th className="text-left py-1 text-gray-500">项目</th><th className="text-left py-1 text-gray-500">牙位</th><th className="text-center py-1 text-gray-500">数量</th><th className="text-right py-1 text-gray-500">单价</th><th className="text-right py-1 text-gray-500">小计</th></tr></thead>
                        <tbody>{items.map((item,i)=>(<tr key={i} className="border-b border-gray-50"><td className="py-1.5">{item.name}</td><td className="py-1.5 text-gray-500">{item.toothNumber||'-'}</td><td className="py-1.5 text-center">{item.quantity||1}</td><td className="py-1.5 text-right">{formatMoney(item.price)}</td><td className="py-1.5 text-right font-medium">{formatMoney(item.price*(item.quantity||1))}</td></tr>))}</tbody>
                      </table>
                      <div className="text-right mt-2 text-sm font-semibold">合计：{formatMoney(total)}</div>
                    </div>

                    {/* 备注编辑 */}
                    <div className="border-t pt-3">
                      {editingNotesId === t.id ? (
                        <div className="flex items-start gap-2">
                          <input value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="治疗备注..." className="flex-1 px-3 py-1.5 border rounded-lg text-sm" autoFocus />
                          <button onClick={() => saveNotes(t.id)} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg"><Save className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingNotesId(null)} className="px-3 py-1.5 text-sm border rounded-lg">取消</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">备注：</span>
                          <span className="text-sm text-gray-700 flex-1">{t.notes || '无'}</span>
                          <button onClick={() => { setEditingNotesId(t.id); setEditNotes(t.notes || '') }} className="p-1 text-gray-400 hover:text-blue-600"><Edit className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>

                    {/* 关联账单 */}
                    <div className="border-t pt-3 flex items-center justify-between">
                      {patient.bills.some(b => b.totalAmount === total) ? (
                        <span className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" />已生成账单</span>
                      ) : (
                        <button onClick={async () => {
                          await fetch('/api/bills', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ patientId: patient.id, treatmentId: t.id, totalAmount: total }) })
                          onUpdate()
                        }} className="text-xs flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"><CreditCard className="w-3 h-3" />生成账单</button>
                      )}
                      <div className="flex items-center gap-2">
                        {/* 状态切换 */}
                        <button onClick={() => toggleStatus(t.id, t.status)}
                          className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg ${t.status === '已完成' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                          {t.status === '已完成' ? '标记为进行中' : '标记为已完成'}
                        </button>
                        {/* 删除治疗 */}
                        <button onClick={() => deleteTreatment(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded" title="删除治疗">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ===================== 财务 =====================
function FinanceSection({ patient, onUpdate }: { patient: PatientData; onUpdate: () => void }) {
  const totalArrears = patient.bills.reduce((s, b) => s + b.balance, 0)
  const [payBillId, setPayBillId] = useState<number | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('现金')
  const [paying, setPaying] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  async function handlePay(billId: number) {
    const amount = parseFloat(payAmount)
    if (!amount || amount <= 0) return
    setPaying(true)
    const res = await fetch('/api/bills/pay', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ billId, amount, method: payMethod }) })
    if (res.ok) { setPayBillId(null); setPayAmount(''); onUpdate() }
    setPaying(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-800">财务记录</h3>
        {totalArrears > 0 && <span className="text-sm px-3 py-0.5 bg-red-100 text-red-700 rounded-full">总欠款: {formatMoney(totalArrears)}</span>}
        {totalArrears === 0 && patient.bills.length > 0 && <span className="text-sm px-3 py-0.5 bg-green-100 text-green-700 rounded-full">已全部结清</span>}
      </div>

      {patient.bills.length === 0 ? <p className="text-gray-400 py-4">暂无账单</p> : (
        <div className="space-y-3">
          {patient.bills.map(b => (
            <div key={b.id}>
              <div onClick={() => setExpandedId(expandedId===b.id?null:b.id)} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">账单 #{b.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.status==='已结清'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{b.status}</span>
                    {expandedId===b.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                <div className="flex gap-6 text-sm mt-2"><span>总额: <strong>{formatMoney(b.totalAmount)}</strong></span><span>已付: <strong className="text-green-600">{formatMoney(b.paidAmount)}</strong></span><span>欠款: <strong className="text-red-600">{formatMoney(b.balance)}</strong></span></div>
                {expandedId!==b.id && <p className="text-xs text-blue-500 mt-1">点击查看详情</p>}
              </div>

              {expandedId===b.id && (
                <div className="border border-blue-200 bg-blue-50/20 rounded-b-lg -mt-px p-5 space-y-4">
                  {b.payments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">付款记录</h4>
                      {b.payments.map((p,i)=>(<div key={i} className="flex gap-4 text-sm text-gray-600"><span>{formatDate(p.createdAt)}</span><span>{p.method}</span><span className="font-medium text-green-600">{formatMoney(p.amount)}</span></div>))}
                    </div>
                  )}
                  {b.status==='未结清' && (
                    <div className="border-t pt-4">
                      {payBillId === b.id ? (
                        <div className="flex items-center gap-3">
                          <input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)} placeholder="收款金额" className="w-32 px-3 py-1.5 border rounded-lg text-sm" autoFocus />
                          <select value={payMethod} onChange={e=>setPayMethod(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm"><option value="现金">现金</option><option value="微信">微信</option><option value="支付宝">支付宝</option><option value="银行卡">银行卡</option><option value="医保">医保</option></select>
                          <button onClick={()=>handlePay(b.id)} disabled={paying} className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">{paying?'处理中...':'确认收款'}</button>
                          <button onClick={()=>{setPayBillId(null);setPayAmount('')}} className="px-3 py-1.5 text-sm text-gray-500">取消</button>
                        </div>
                      ) : (
                        <button onClick={()=>{setPayBillId(b.id);setPayAmount(String(b.balance))}} className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg"><CreditCard className="w-4 h-4" />收款（欠款 {formatMoney(b.balance)}）</button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===================== 影像 =====================
function ImagesSection({ patient, onUpdate }: { patient: PatientData; onUpdate: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [imgType, setImgType] = useState('口内照')
  const [imgNote, setImgNote] = useState('')
  const [imgTooth, setImgTooth] = useState('')
  const [previewId, setPreviewId] = useState<number | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('patientId', String(patient.id))
    formData.append('type', imgType)
    formData.append('note', imgNote)
    formData.append('toothNumber', imgTooth)

    const res = await fetch('/api/images', { method:'POST', body: formData })
    if (res.ok) { setImgNote(''); setImgTooth(''); onUpdate(); e.target.value = '' }
    setUploading(false)
  }

  const previewImg = patient.images.find(i => i.id === previewId)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">影像资料</h3>

      {/* 上传 */}
      <div className="border rounded-xl p-5 space-y-4">
        <h4 className="font-medium text-sm">上传新影像</h4>
        <div className="flex items-center gap-4 flex-wrap">
          <select value={imgType} onChange={e=>setImgType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="口内照">口内照</option><option value="面部照">面部照</option><option value="X光片">X光片</option><option value="CT">CT</option><option value="其他">其他</option>
          </select>
          <input value={imgTooth} onChange={e=>setImgTooth(e.target.value)} placeholder="关联牙位号（可选）" className="w-40 px-3 py-2 border rounded-lg text-sm" />
          <input value={imgNote} onChange={e=>setImgNote(e.target.value)} placeholder="备注说明" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer">
            <Upload className="w-4 h-4" /> {uploading?'上传中...':'选择文件'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {patient.images.length === 0 ? <p className="text-gray-400 py-4">暂无影像资料</p> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {patient.images.map(img => (
            <div key={img.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 h-32 flex items-center justify-center cursor-pointer relative" onClick={()=>setPreviewId(previewId===img.id?null:img.id)}>
                <img src={img.filePath} alt={img.type} className="h-full w-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
                <Eye className="w-6 h-6 text-gray-400 absolute" />
              </div>
              <div className="p-2"><span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{img.type}</span>{img.toothNumber&&<span className="text-xs text-gray-500 ml-1">#{img.toothNumber}</span>}<p className="text-xs text-gray-400 mt-1">{formatDate(img.createdAt)}</p>{img.note&&<p className="text-xs text-gray-500">{img.note}</p>}</div>
            </div>
          ))}
        </div>
      )}

      {/* 预览放大 */}
      {previewImg && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={()=>setPreviewId(null)}>
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-xl p-4" onClick={e=>e.stopPropagation()}>
            <button onClick={() => setPreviewId(null)} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 z-10" title="关闭">
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <img src={previewImg.filePath} alt={previewImg.type} className="max-h-[65vh] rounded-lg object-contain" />
            <div className="flex justify-between mt-3">
              <div>
                <span className="text-sm font-medium">{previewImg.type}</span>
                {previewImg.toothNumber && <span className="text-sm text-gray-500 ml-2">· {previewImg.toothNumber}号牙</span>}
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">{formatDate(previewImg.createdAt)}</span>
                {previewImg.note && <p className="text-sm text-gray-600">{previewImg.note}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===================== 预约 =====================
function AppointmentsSection({ patient, onUpdate }: { patient: PatientData; onUpdate: () => void }) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{date:string;time:string;type:string;doctor:string;notes:string}>({date:'',time:'',type:'初诊',doctor:'',notes:''})

  function startEdit(a: PatientData['appointments'][0]) {
    setEditingId(a.id)
    setEditForm({ date: a.date, time: a.time, type: a.type, doctor: a.doctor||'', notes: a.notes||'' })
  }

  async function saveEdit() {
    if (!editingId) return
    await fetch(`/api/appointments/${editingId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(editForm) })
    setEditingId(null)
    onUpdate()
  }

  async function updateStatus(aid: number, status: string) {
    await fetch(`/api/appointments/${aid}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) })
    onUpdate()
  }

  const statusColors: Record<string,string> = { '已预约':'bg-blue-100 text-blue-700','已到诊':'bg-green-100 text-green-700','已取消':'bg-gray-100 text-gray-500','已过期':'bg-red-100 text-red-500' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">预约/复诊记录</h3>
        <Link href={`/appointments/new?patientId=${patient.id}`} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">新建预约</Link>
      </div>

      <h4 className="text-sm font-medium text-gray-500">复诊提醒</h4>
      {patient.reminders.length === 0 ? <p className="text-sm text-gray-400">暂无提醒</p> : (
        <div className="space-y-2">{patient.reminders.map(r=>(
          <div key={r.id} className="flex items-center gap-3 text-sm border rounded-lg p-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{r.type}</span>
            <span>复诊日期: {r.remindDate}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${r.status==='待提醒'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-500'}`}>{r.status}</span>
            {r.message&&<span className="text-gray-400">- {r.message}</span>}
          </div>
        ))}</div>
      )}

      <h4 className="text-sm font-medium text-gray-500 mt-4">历史预约</h4>
      {patient.appointments.length === 0 ? <p className="text-sm text-gray-400">暂无预约记录</p> : (
        <div className="space-y-2">
          {patient.appointments.map(a => (
            <div key={a.id}>
              {editingId === a.id ? (
                <div className="border border-amber-200 bg-amber-50/30 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-gray-500">日期</label><input type="date" value={editForm.date} onChange={e=>setEditForm(p=>({...p,date:e.target.value}))} className="w-full px-3 py-1.5 border rounded text-sm" /></div>
                    <div><label className="text-xs text-gray-500">时间</label><input type="time" value={editForm.time} onChange={e=>setEditForm(p=>({...p,time:e.target.value}))} className="w-full px-3 py-1.5 border rounded text-sm" /></div>
                    <div><label className="text-xs text-gray-500">类型</label><select value={editForm.type} onChange={e=>setEditForm(p=>({...p,type:e.target.value}))} className="w-full px-3 py-1.5 border rounded text-sm"><option value="初诊">初诊</option><option value="复诊">复诊</option><option value="治疗">治疗</option></select></div>
                    <div><label className="text-xs text-gray-500">医生</label><input value={editForm.doctor} onChange={e=>setEditForm(p=>({...p,doctor:e.target.value}))} className="w-full px-3 py-1.5 border rounded text-sm" /></div>
                  </div>
                  <div><label className="text-xs text-gray-500">备注</label><input value={editForm.notes} onChange={e=>setEditForm(p=>({...p,notes:e.target.value}))} className="w-full px-3 py-1.5 border rounded text-sm" /></div>
                  <div className="flex justify-end gap-2"><button onClick={()=>setEditingId(null)} className="px-3 py-1.5 text-sm border rounded-lg">取消</button><button onClick={saveEdit} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">保存</button></div>
                </div>
              ) : (
                <div onClick={() => setExpandedId(expandedId===a.id?null:a.id)} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{a.date} {a.time}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{a.type}</span>
                      <select value={a.status} onChange={e=>{e.stopPropagation();updateStatus(a.id,e.target.value)}} onClick={e=>e.stopPropagation()} className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[a.status]||''}`}><option value="已预约">已预约</option><option value="已到诊">已到诊</option><option value="已取消">已取消</option></select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={e=>{e.stopPropagation();startEdit(a)}} className="p-1 text-gray-400 hover:text-blue-600" title="编辑"><Edit className="w-3.5 h-3.5" /></button>
                      {expandedId===a.id?<ChevronUp className="w-4 h-4 text-gray-400"/>:<ChevronDown className="w-4 h-4 text-gray-400"/>}
                    </div>
                  </div>
                  {a.doctor && <p className="text-xs text-gray-500 mt-1">医生: {a.doctor}</p>}
                  {expandedId===a.id && a.notes && <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded">备注: {a.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Plus2() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
}
