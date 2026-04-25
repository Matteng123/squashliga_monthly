'use client'

import { Month } from '@/lib/types'
import { formatMonth } from '@/lib/dateUtils'

interface Props {
  months: Month[]
  selectedMonth: Month | null
  onSelectMonth: (month: Month) => void
}

export default function MonthSelector({ months, selectedMonth, onSelectMonth }: Props) {
  if (!selectedMonth) return null

  return (
    <div className="card mb-6">
      <label className="label">Month</label>
      <select
        value={selectedMonth.id}
        onChange={e => {
          const month = months.find(m => m.id === e.target.value)
          if (month) onSelectMonth(month)
        }}
        className="input"
      >
        {months.map(month => (
          <option key={month.id} value={month.id}>
            {formatMonth(month.year, month.month)}
          </option>
        ))}
      </select>
    </div>
  )
}
