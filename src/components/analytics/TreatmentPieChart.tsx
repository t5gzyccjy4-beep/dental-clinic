'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']

interface TreatmentData {
  name: string
  value: number
}

export default function TreatmentPieChart() {
  const [data, setData] = useState<TreatmentData[]>([])

  useEffect(() => {
    fetch('/api/stats?type=treatment-ranking')
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(() => {})
  }, [])

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">暂无治疗数据</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(_value, _name, props) => {
              const total = data.reduce((s, d) => s + d.value, 0)
              const pct = total > 0 ? ((Number(props.payload?.value || 0) / total) * 100).toFixed(0) : '0'
              return [`${pct}%`, '占比']
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
