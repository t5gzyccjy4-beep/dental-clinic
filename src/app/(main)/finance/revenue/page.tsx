'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatMoney, formatDate, getToday, getFirstDayOfMonth } from '@/lib/utils'
import { ArrowLeft, Calendar, DollarSign, TrendingUp, CreditCard, Search } from 'lucide-react'

interface PaymentData {
  id: number
  amount: number
  method: string
  createdAt: string
  patientName: string
  patientId: number | null
  billId: number
}

interface StatsData {
  payments: PaymentData[]
  totalRevenue: number
  dailyRevenue: Record<string, number>
  methodStats: Record<string, number>
}

export default function RevenuePage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [startDate, setStartDate] = useState(getFirstDayOfMonth())
  const [endDate, setEndDate] = useState(getToday())
  const [method, setMethod] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [startDate, endDate, method])

  async function loadData() {
    setLoading(true)
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (method) params.set('method', method)
    const res = await fetch('/api/payments?' + params)
    if (res.ok) {
      setData(await res.json())
    }
    setLoading(false)
  }

  const methodLabels: Record<string, string> = { '现金': '现金', '微信': '微信', '支付宝': '支付宝', '银行卡': '银行卡', '医保': '医保' }
  const methodColors: Record<string, string> = { '现金': 'bg-yellow-100 text-yellow-700', '微信': 'bg-green-100 text-green-700', '支付宝': 'bg-blue-100 text-blue-700', '银行卡': 'bg-purple-100 text-purple-700', '医保': 'bg-orange-100 text-orange-700' }

  // 按日期排序的每日收入
  const dailyEntries = data ? Object.entries(data.dailyRevenue).sort((a, b) => a[0].localeCompare(b[0])) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">收入详情</h1>
          <p className="text-sm text-gray-500">查看所有收款记录和收入统计</p>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">日期范围：</span>
          </div>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <span className="text-gray-400">至</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <select value={method} onChange={e => setMethod(e.target.value)} className="px-3 py-2 border rounded-lg text-sm ml-4">
            <option value="">全部方式</option>
            <option value="现金">现金</option>
            <option value="微信">微信</option>
            <option value="支付宝">支付宝</option>
            <option value="银行卡">银行卡</option>
            <option value="医保">医保</option>
          </select>
          <button onClick={() => { setStartDate(''); setEndDate(''); setMethod('') }} className="text-sm text-blue-600 hover:underline">清除筛选</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : !data ? (
        <div className="text-center py-20 text-gray-400">暂无数据</div>
      ) : (
        <>
          {/* 汇总卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-600" /></div>
                <div><p className="text-sm text-gray-500">总收入</p><p className="text-2xl font-bold text-green-600">{formatMoney(data.totalRevenue)}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><CreditCard className="w-5 h-5 text-blue-600" /></div>
                <div><p className="text-sm text-gray-500">收款笔数</p><p className="text-2xl font-bold text-gray-800">{data.payments.length} 笔</p></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
                <div><p className="text-sm text-gray-500">日均收入</p><p className="text-2xl font-bold text-gray-800">{formatMoney(dailyEntries.length > 0 ? data.totalRevenue / dailyEntries.length : 0)}</p></div>
              </div>
            </div>
          </div>

          {/* 收款方式分布 */}
          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">收款方式分布</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(data.methodStats).map(([m, amount]) => (
                <div key={m} className="text-center p-3 bg-gray-50 rounded-lg">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${methodColors[m] || 'bg-gray-100'}`}>{methodLabels[m] || m}</span>
                  <p className="text-lg font-bold text-gray-800 mt-2">{formatMoney(amount)}</p>
                  <p className="text-xs text-gray-400">{data.totalRevenue > 0 ? ((amount / data.totalRevenue) * 100).toFixed(1) : 0}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* 每日收入明细 */}
          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">每日收入明细</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-500">日期</th>
                    <th className="text-right py-2 text-gray-500">收入金额</th>
                    <th className="text-right py-2 text-gray-500">占比</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyEntries.map(([day, amount]) => (
                    <tr key={day} className="border-b border-gray-50">
                      <td className="py-2 font-medium">{day}</td>
                      <td className="py-2 text-right font-medium text-green-600">{formatMoney(amount)}</td>
                      <td className="py-2 text-right text-gray-500">{((amount / data.totalRevenue) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 收款记录列表 */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50">
              <h3 className="text-base font-semibold text-gray-800">收款记录 ({data.payments.length} 笔)</h3>
            </div>
            <div className="divide-y">
              {data.payments.length === 0 ? (
                <div className="px-5 py-12 text-center text-gray-400">暂无收款记录</div>
              ) : data.payments.map(p => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">{formatDate(p.createdAt)}</span>
                    {p.patientId ? (
                      <Link href={`/patients/${p.patientId}`} className="text-sm font-medium text-blue-600 hover:underline">{p.patientName}</Link>
                    ) : (
                      <span className="text-sm text-gray-600">{p.patientName}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${methodColors[p.method] || 'bg-gray-100'}`}>{p.method}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">账单 #{p.billId}</span>
                    <span className="text-sm font-semibold text-green-600">{formatMoney(p.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
