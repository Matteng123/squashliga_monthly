'use client'

import { Month } from '@/lib/types'
import { formatMonth, formatDate } from '@/lib/dateUtils'
import { Users } from 'lucide-react'

interface Props {
  month: Month
  isCurrentMonth: boolean
  isDeadlinePassed: boolean
}

export default function AdminSummaryCard({ month, isCurrentMonth, isDeadlinePassed }: Props) {
  const uniquePlayers = new Set(month.playDays.flatMap(pd => pd.playersJoined)).size
  const totalSlots = month.playDays.reduce((sum, pd) => sum + pd.playersJoined.length, 0)

  return (
    <div className={`card ${isCurrentMonth ? 'border-l-4 border-l-emerald-600' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-white">{formatMonth(month.year, month.month)}</h3>
          <p className="text-xs text-slate-400">Deadline: {formatDate(month.deadlineDate)}</p>
        </div>
        {isCurrentMonth && (
          <span className="badge bg-emerald-900 text-emerald-200 text-xs">Current</span>
        )}
      </div>

      <div className="bg-slate-900 rounded p-3 mb-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Unique Players</p>
            <p className="text-2xl font-bold text-emerald-400">{uniquePlayers}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Total Slots</p>
            <p className="text-2xl font-bold text-orange-400">{totalSlots}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {month.playDays.map(playDay => (
          <div key={playDay.id} className="flex items-center justify-between text-sm px-2 py-1 bg-slate-900 rounded">
            <span className="text-slate-300">{formatDate(playDay.date)}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                <Users size={14} className="inline mr-1" />
                {playDay.playersJoined.length}
              </span>
              <span className="font-semibold text-emerald-400 text-xs">{playDay.courtsRequired} court{playDay.courtsRequired !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ))}
      </div>

      {isDeadlinePassed && (
        <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-orange-400">
          🔒 Deadline passed – emails sent
        </div>
      )}
    </div>
  )
}
