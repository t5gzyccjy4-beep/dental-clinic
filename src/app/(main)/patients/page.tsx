'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Plus, Eye, Trash2, Calendar, ChevronDown, ChevronUp, Filter, Download, CheckSquare, Square, Bell, AlertTriangle, X, ArrowUpDown } from 'lucide-react'
import { formatDate, formatMoney, getToday } from '@/lib/utils'

interface Patient {
  id: number
  name: string
  gender: string
  birthday: string | null
  phone: string | null
  address: string | null
  allergies: string | null
  medicalHistory: string | null
  createdAt: string
  lastVisitDate: string | null
  appointmentCount: number
  billCount: number
  totalArrears: number
  hasAllergies: boolean
  hasHistory: boolean
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [role, setRole] = useState('receptionist')

  // 筛选状态
  const [gender, setGender] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [hasAllergies, setHasAllergies] = useState('')
  const [hasHistory, setHasHistory] = useState('')
  const [noVisitMonths, setNoVisitMonths] = useState('')
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortDir, setSortDir] = useState('desc')

  // 批量操作
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [batchRemindDate, setBatchRemindDate] = useState(getToday())
  const [batchMessage, setBatchMessage] = useState('请及时复诊')
  const [batchProcessing, setBatchProcessing] = useState(false)

  useEffect(() => { fetch('/api/auth').then(r => r.json()).then(d => { if (d.user?.role) setRole(d.user.role) }).catch(() => {}) }, [])
  useEffect(() => { loadPatients() }, [page, search, gender, startDate, endDate, hasAllergies, hasHistory, noVisitMonths, sortBy, sortDir])

  async function loadPatients() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (gender) params.set('gender', gender)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (hasAllergies) params.set('hasAllergies', hasAllergies)
    if (hasHistory) params.set('hasHistory', hasHistory)
    if (noVisitMonths) params.set('noVisitMonths', noVisitMonths)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortDir) params.set('sortDir', sortDir)

    const res = await fetch(`/api/patients?${params}`)
    const data = await res.json()
    setPatients(data.patients)
    setTotal(data.total)
    setTotalPages(data.totalPages)
    setLoading(false)
    setSelectedIds(new Set())
  }

  function handleSearch(val: string) { setSearch(val); setPage(1) }
  function toggleSort(field: string) {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('desc')
    }
    setPage(1)
  }

  function clearFilters() {
    setGender(''); setStartDate(''); setEndDate(''); setHasAllergies(''); setHasHistory(''); setNoVisitMonths(''); setPage(1)
  }

  const activeFilterCount = [gender, startDate, hasAllergies, hasHistory, noVisitMonths].filter(Boolean).length

  // 选择逻辑
  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  function toggleSelectAll() {
    if (selectedIds.size === patients.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(patients.map(p => p.id)))
    }
  }

  // 批量操作
  async function batchDelete() {
    if (!confirm(`确定删除选中的 ${selectedIds.size} 位患者？此操作不可撤销！`)) return
    setBatchProcessing(true)
    await fetch('/api/patients/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selectedIds), action: 'delete' }),
    })
    setBatchProcessing(false)
    setShowBatchModal(false)
    loadPatients()
  }

  async function batchCreateReminders() {
    setBatchProcessing(true)
    await fetch('/api/patients/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selectedIds), action: 'create-reminders', remindDate: batchRemindDate, message: batchMessage }),
    })
    setBatchProcessing(false)
    setShowBatchModal(false)
    alert(`已为 ${selectedIds.size} 位患者创建复诊提醒`)
    setSelectedIds(new Set())
  }

  // 导出 CSV
  function exportCSV() {
    const headers = ['ID','姓名','性别','手机号','首次录入','最近就诊','预约次数','账单数','欠费金额','过敏史','既往病史']
    const rows = patients.map(p => [
      p.id, p.name, p.gender, p.phone || '',
      formatDate(p.createdAt), p.lastVisitDate || '无',
      p.appointmentCount, p.billCount,
      p.totalArrears > 0 ? `¥${p.totalArrears.toFixed(2)}` : '0',
      p.allergies || '无', p.medicalHistory || '无'
    ])
    const csvContent = '﻿' + [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `患者列表_${getToday()}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  async function handleDelete(id: number) {
    if (!confirm('确定删除该患者？此操作不可撤销。')) return
    await fetch(`/api/patients/${id}`, { method: 'DELETE' })
    loadPatients()
  }

  const SortIcon = ({ field }: { field: string }) => (
    <ArrowUpDown className={`w-3 h-3 inline ml-1 cursor-pointer ${sortBy === field ? 'text-blue-600' : 'text-gray-300'}`} onClick={() => toggleSort(field)} />
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">患者管理</h1>
        <div className="flex items-center gap-2">
          {(role === 'admin' || role === 'doctor') && (
            <button onClick={exportCSV} disabled={patients.length === 0} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50">
              <Download className="w-4 h-4" /> 导出 CSV
            </button>
          )}
          {(role === 'admin' || role === 'doctor') && (
            <Link href="/patients/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Plus className="w-4 h-4" /> 新增患者
            </Link>
          )}
        </div>
      </div>

      {/* 搜索与筛选 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索姓名或手机号..." value={search}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" /> 高级筛选
            {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">{activeFilterCount}</span>}
            {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* 批量操作栏 */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">已选 {selectedIds.size} 人</span>
              {(role === 'admin' || role === 'doctor') && (
                <button onClick={() => setShowBatchModal(true)} className="flex items-center gap-1 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600">
                  <Bell className="w-4 h-4" /> 批量提醒
                </button>
              )}
              {role === 'admin' && (
                <button onClick={batchDelete} disabled={batchProcessing}
                  className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50">
                  <Trash2 className="w-4 h-4" /> 批量删除
                </button>
              )}
            </div>
          )}
        </div>

        {/* 高级筛选面板 */}
        {showFilters && (
          <div className="bg-white border rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">性别</label>
                <select value={gender} onChange={e => { setGender(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">全部</option><option value="男">男</option><option value="女">女</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">录入开始</label>
                <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">录入结束</label>
                <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">过敏史</label>
                <select value={hasAllergies} onChange={e => { setHasAllergies(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">全部</option><option value="yes">有过敏史</option><option value="no">无过敏史</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">既往病史</label>
                <select value={hasHistory} onChange={e => { setHasHistory(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">全部</option><option value="yes">有既往病史</option><option value="no">无既往病史</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">未复诊时长</label>
                <select value={noVisitMonths} onChange={e => { setNoVisitMonths(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">全部</option><option value="3">3个月未复诊</option><option value="6">6个月未复诊</option><option value="12">12个月未复诊</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">清除全部筛选</button>
            </div>
          </div>
        )}
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="w-10 px-3 py-3">
                  {(role === 'admin' || role === 'doctor') ? (
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-blue-600">
                      {selectedIds.size === patients.length && patients.length > 0 ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                    </button>
                  ) : null}
                </th>
                <th className="text-left px-3 py-3 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left px-3 py-3 text-sm font-medium text-gray-500">姓名 <SortIcon field="name" /></th>
                <th className="text-left px-3 py-3 text-sm font-medium text-gray-500">性别</th>
                <th className="text-left px-3 py-3 text-sm font-medium text-gray-500">手机号</th>
                <th className="text-left px-3 py-3 text-sm font-medium text-gray-500 whitespace-nowrap">首次录入 <SortIcon field="createdAt" /></th>
                <th className="text-left px-3 py-3 text-sm font-medium text-gray-500 whitespace-nowrap">最近就诊</th>
                <th className="text-center px-3 py-3 text-sm font-medium text-gray-500 whitespace-nowrap">预约</th>
                <th className="text-center px-3 py-3 text-sm font-medium text-gray-500 whitespace-nowrap">账单</th>
                <th className="text-right px-3 py-3 text-sm font-medium text-gray-500 whitespace-nowrap">欠费</th>
                <th className="text-center px-3 py-3 text-sm font-medium text-gray-500 whitespace-nowrap">健康标签</th>
                <th className="text-right px-3 py-3 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={12} className="px-4 py-12 text-center text-gray-400">加载中...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={12} className="px-4 py-12 text-center text-gray-400">暂无患者数据</td></tr>
              ) : (
                patients.map(p => (
                  <tr key={p.id} className={`hover:bg-gray-50 ${selectedIds.has(p.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-3 py-3">
                      {(role === 'admin' || role === 'doctor') ? (
                        <button onClick={() => toggleSelect(p.id)} className="text-gray-400 hover:text-blue-600">
                          {selectedIds.has(p.id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                        </button>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500">{p.id}</td>
                    <td className="px-3 py-3">
                      <Link href={`/patients/${p.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">{p.name}</Link>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600">{p.gender}</td>
                    <td className="px-3 py-3 text-sm text-gray-600">{p.phone || '-'}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {p.lastVisitDate ? (
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gray-400" />{p.lastVisitDate}</span>
                      ) : <span className="text-gray-400 text-xs">暂无</span>}
                    </td>
                    <td className="px-3 py-3 text-sm text-center">{p.appointmentCount}</td>
                    <td className="px-3 py-3 text-sm text-center">{p.billCount}</td>
                    <td className="px-3 py-3 text-right">
                      {p.totalArrears > 0 ? (
                        <span className="text-sm font-medium text-red-600">{formatMoney(p.totalArrears)}</span>
                      ) : <span className="text-sm text-gray-300">¥0</span>}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {p.hasAllergies && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700" title={`过敏史: ${p.allergies}`}>过敏</span>}
                        {p.hasHistory && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700" title={`既往病史: ${p.medicalHistory}`}>病史</span>}
                        {!p.hasAllergies && !p.hasHistory && <span className="text-xs text-gray-300">-</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/patients/${p.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="查看详情"><Eye className="w-4 h-4" /></Link>
                        {role === 'admin' && (
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded" title="删除"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <span className="text-sm text-gray-500">共 {total} 位患者</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50">上一页</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 7) { pageNum = i + 1 }
                else if (page <= 4) { pageNum = i + 1 }
                else if (page >= totalPages - 3) { pageNum = totalPages - 6 + i }
                else { pageNum = page - 3 + i }
                return <button key={pageNum} onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 text-sm rounded ${pageNum === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}>{pageNum}</button>
              })}
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50">下一页</button>
            </div>
          )}
        </div>
      </div>

      {/* 批量操作弹窗 */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowBatchModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">批量操作 - 已选 {selectedIds.size} 人</h2>
              <button onClick={() => setShowBatchModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="border-t pt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">创建复诊提醒</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">提醒日期</label>
                    <input type="date" value={batchRemindDate} onChange={e => setBatchRemindDate(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">提醒消息</label>
                    <input value={batchMessage} onChange={e => setBatchMessage(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <button onClick={batchCreateReminders} disabled={batchProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50">
                    <Bell className="w-4 h-4" /> {batchProcessing ? '处理中...' : '批量创建提醒'}
                  </button>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-red-700 mb-3 flex items-center gap-1"><AlertTriangle className="w-4 h-4" />危险操作</h3>
                <button onClick={batchDelete} disabled={batchProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50">
                  <Trash2 className="w-4 h-4" /> 批量删除 {selectedIds.size} 位患者
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
