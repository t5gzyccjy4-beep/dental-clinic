'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DayData {
  date: string
  amount: number
}

export default function RevenueChart() {
  const [data, setData] = useState<DayData[]>([])

  useEffect(() => {
    fetch('/api/stats?type=monthly-revenue')
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(() => {})
  }, [])

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">暂无收入数据</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [`¥${(Number(value || 0)).toLocaleString()}`, '收入']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
