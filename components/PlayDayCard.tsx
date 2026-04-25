'use client'

import { PlayDay } from '@/lib/types'
import { formatDate } from '@/lib/dateUtils'
import useAppStore from '@/lib/store'
import { Users } from 'lucide-react'

interface Props {
  playDay: PlayDay
  monthId: string
  isPlayerJoined: boolean
  isLocked: boolean
  onToggle: () => void
}

export default function PlayDayCard({
  playDay,
  monthId,
  isPlayerJoined,
  isLocked,
  onToggle,
}: Props) {
  return (
    <div className="card flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div>
            <h3 className="font-semibold text-white">{formatDate(playDay.date)}</h3>
            <p className="text-sm text-slate-400">
              <Users size={14} className="inline mr-1" />
              {playDay.playersJoined.length} player{playDay.playersJoined.length !== 1 ? 's' : ''}
              {playDay.courtsRequired > 0 && ` • ${playDay.courtsRequired} court${playDay.courtsRequired !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className={`badge ${playDay.status === 'open' ? 'badge-open' : 'badge-locked'}`}>
            {playDay.status === 'open' ? '✓ Open' : '🔒 Locked'}
          </span>
        </div>
      </div>

      <button
        onClick={onToggle}
        disabled={isLocked}
        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex-shrink-0 whitespace-nowrap ${
          isPlayerJoined
            ? 'bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50'
        } ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {isPlayerJoined ? '✓ Joined' : '+ Join'}
      </button>
    </div>
  )
}
