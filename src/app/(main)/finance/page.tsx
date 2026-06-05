'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatMoney, formatDate, getToday, getFirstDayOfMonth } from '@/lib/utils'
import { ChevronDown, ChevronUp, CreditCard, Search, Calendar, DollarSign, TrendingUp } from 'lucide-react'

interface BillData {
  id: number
  patientId: number
  totalAmount: number
  paidAmount: number
  balance: number
  status: string
  createdAt: string
  patient: { name: string }
  payments: Array<{ amount: number; method: string; createdAt: string }>
}

export default function FinancePage() {
  const [bills, setBills] = useState<BillData[]>([])
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState(getFirstDayOfMonth())
  const [endDate, setEndDate] = useState(getToday())
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [payBillId, setPayBillId] = useState<number | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('现金')
  const [paying, setPaying] = useState(false)

  useEffect(() => { loadBills() }, [status, startDate, endDate])

  async function loadBills() {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    const res = await fetch('/api/bills?' + params)
    const data = await res.json()
    setBills(data.bills)
  }

  async function handlePay(billId: number) {
    const amount = parseFloat(payAmount)
    if (!amount || amount <= 0) return
    setPaying(true)
    const res = await fetch('/api/bills/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billId, amount, method: payMethod }),
    })
    if (res.ok) {
      setPayBillId(null)
      setPayAmount('')
      loadBills()
    }
    setPaying(false)
  }

  const totalRevenue = bills.reduce((s, b) => s + b.paidAmount, 0)
  const totalArrears = bills.reduce((s, b) => s + b.balance, 0)
  const totalAmount = bills.reduce((s, b) => s + b.totalAmount, 0)
  const unpaidCount = bills.filter(b => b.status === '未结清').length
  const paidCount = bills.filter(b => b.status === '已结清').length

  // 按支付方式统计
  const methodStats: Record<string, number> = {}
  bills.forEach(b => b.payments.forEach(p => {
    methodStats[p.method] = (methodStats[p.method] || 0) + p.amount
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">财务管理</h1>
        <Link href="/patients" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          患者列表（选患者开单）
        </Link>
      </div>

      {/* 统计摘要 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">账单总额</p>
          <p className="text-xl font-bold text-gray-800">{formatMoney(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">已收款</p>
          <p className="text-xl font-bold text-green-600">{formatMoney(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">欠款</p>
          <p className="text-xl font-bold text-red-600">{formatMoney(totalArrears)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">已结清</p>
          <p className="text-xl font-bold text-green-600">{paidCount} 笔</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">未结清</p>
          <p className="text-xl font-bold text-red-600">{unpaidCount} 笔</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">总笔数</p>
          <p className="text-xl font-bold text-gray-800">{bills.length} 笔</p>
        </div>
      </div>

      {/* 支付方式统计 */}
      {Object.keys(methodStats).length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" />收款方式分布</h3>
          <div className="flex gap-6 flex-wrap">
            {Object.entries(methodStats).map(([method, amount]) => (
              <div key={method} className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{method}</span>
                <span className="text-sm font-semibold text-gray-800">{formatMoney(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 过滤区域 */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">日期范围：</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <span className="text-gray-400">至</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm ml-4">
            <option value="">全部状态</option>
            <option value="已结清">已结清</option>
            <option value="未结清">未结清</option>
          </select>
          <button
            onClick={() => { setStartDate(''); setEndDate(''); setStatus('') }}
            className="text-sm text-blue-600 hover:underline"
          >
            清除筛选
          </button>
        </div>
      </div>

      {/* 账单列表 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="divide-y">
          {bills.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-400">暂无账单数据</div>
          ) : bills.map(b => (
            <div key={b.id}>
              <div
                onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 text-sm font-medium text-gray-700">#{b.id}</div>
                  <div className="flex-1">
                    <Link
                      href={`/patients/${b.patientId}`}
                      onClick={e => e.stopPropagation()}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {b.patient.name}
                    </Link>
                    <p className="text-xs text-gray-400">{formatDate(b.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span>总额 <strong className="text-gray-800">{formatMoney(b.totalAmount)}</strong></span>
                    <span>已付 <strong className="text-green-600">{formatMoney(b.paidAmount)}</strong></span>
                    <span>欠款 <strong className="text-red-600">{formatMoney(b.balance)}</strong></span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === '已结清' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
                {expandedId === b.id ? <ChevronUp className="w-4 h-4 text-gray-400 ml-3" /> : <ChevronDown className="w-4 h-4 text-gray-400 ml-3" />}
              </div>

              {/* 展开详情 */}
              {expandedId === b.id && (
                <div className="px-5 py-4 bg-gray-50 border-t space-y-4">
                  {/* 付款记录 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">付款记录</h4>
                    {b.payments.length === 0 ? (
                      <p className="text-sm text-gray-400">暂无付款</p>
                    ) : (
                      <div className="space-y-1.5">
                        {b.payments.map((p, i) => (
                          <div key={i} className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="w-24">{formatDate(p.createdAt)}</span>
                            <span className="w-16">{p.method}</span>
                            <span className="font-medium text-green-600">{formatMoney(p.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 收款操作 */}
                  {b.status === '未结清' && (
                    <div className="border-t pt-4">
                      {payBillId === b.id ? (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">收款金额</span>
                          <input
                            type="number"
                            value={payAmount}
                            onChange={e => setPayAmount(e.target.value)}
                            placeholder="输入金额"
                            className="w-32 px-3 py-1.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                            className="px-3 py-1.5 border rounded-lg text-sm">
                            <option value="现金">现金</option>
                            <option value="微信">微信</option>
                            <option value="支付宝">支付宝</option>
                            <option value="银行卡">银行卡</option>
                            <option value="医保">医保</option>
                          </select>
                          <button
                            onClick={() => handlePay(b.id)}
                            disabled={paying}
                            className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            {paying ? '处理中...' : '确认收款'}
                          </button>
                          <button onClick={() => { setPayBillId(null); setPayAmount('') }}
                            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setPayBillId(b.id); setPayAmount(String(b.balance)) }}
                          className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          <CreditCard className="w-4 h-4" /> 收款（欠款 {formatMoney(b.balance)}）
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
