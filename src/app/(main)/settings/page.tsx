'use client'

import { useState, useEffect } from 'react'
import { Save, Database, Download } from 'lucide-react'

interface SettingsData {
  clinicName: string
  address: string
  phone: string
  defaultReminderDays: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    clinicName: '', address: '', phone: '', defaultReminderDays: '[3,1,0]'
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.settings) setSettings(d.settings)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (res.ok) setMessage('保存成功')
    else setMessage('保存失败')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">系统设置</h1>

      {/* 门诊信息 */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border p-6 space-y-5">
        <h3 className="text-lg font-semibold text-gray-800">门诊信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">门诊名称</label>
            <input type="text" value={settings.clinicName}
              onChange={e => setSettings(p => ({ ...p, clinicName: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">电话</label>
            <input type="text" value={settings.phone}
              onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">地址</label>
            <input type="text" value={settings.address}
              onChange={e => setSettings(p => ({ ...p, address: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
            <Save className="w-4 h-4" /> {saving ? '保存中...' : '保存设置'}
          </button>
          {message && <span className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>{message}</span>}
        </div>
      </form>

      {/* 数据管理 */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">数据管理</h3>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
            <Database className="w-4 h-4" /> 数据备份
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
            <Download className="w-4 h-4" /> 导出患者数据 (CSV)
          </button>
        </div>
      </div>
    </div>
  )
}
