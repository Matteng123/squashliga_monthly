'use client'

import { PlayDay } from '@/lib/types'
import { formatDate } from '@/lib/dateUtils'
import useAppStore from '@/lib/store'
import { Users } from 'lucide-react'
import { useState } from 'react'
import { de } from '@/lib/i18n'

interface Props {
  playDay: PlayDay
  monthId: string
  isPlayerJoined: boolean
  isLocked: boolean
  isMonthCommitted?: boolean
  paymentStatus?: 'open' | 'editing' | 'committed' | 'payment_submitted' | 'confirmed' | 'unpaid'
  onToggle: () => void
}

export default function PlayDayCard({
  playDay,
  monthId,
  isPlayerJoined,
  isLocked,
  isMonthCommitted,
  paymentStatus,
  onToggle,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)

  // Determine if payment is confirmed (player paid for this game)
  const isConfirmed = paymentStatus === 'confirmed'
  const isUnpaid = paymentStatus === 'unpaid'
  const isDisabled = isLocked || isMonthCommitted || isConfirmed

  const handleToggle = () => {
    setIsLoading(true)
    onToggle()
    setTimeout(() => setIsLoading(false), 300)
  }

  // Show payment status if player joined this game
  const getPaymentBadge = () => {
    if (!isPlayerJoined) return null

    if (isConfirmed) {
      return <span className="badge bg-emerald-500/20 border-emerald-500 text-emerald-300">✓ Bezahlt</span>
    }
    if (isUnpaid) {
      return <span className="badge bg-red-500/20 border-red-500 text-red-300">⚠️ Nicht bezahlt</span>
    }
    if (paymentStatus === 'payment_submitted') {
      return <span className="badge bg-yellow-500/20 border-yellow-500 text-yellow-300">⏳ Ausstehend</span>
    }
    return null
  }

  return (
    <div className={`card flex items-start justify-between gap-4 ${
      isConfirmed && isPlayerJoined ? 'border-l-4 border-l-emerald-500 bg-emerald-950/20' : ''
    }`}>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div>
            <h3 className="font-semibold text-white">{formatDate(playDay.date)}</h3>
            <p className="text-sm text-slate-400">
              <Users size={14} className="inline mr-1" />
              {playDay.playersJoined.length} {de.common.players}
              {playDay.courtsRequired > 0 && ` • ${playDay.courtsRequired} ${de.common.courts}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className={`badge ${playDay.status === 'open' ? 'badge-open' : 'badge-locked'}`}>
            {playDay.status === 'open' ? de.common.open : de.common.locked}
          </span>
          {getPaymentBadge()}
        </div>
      </div>

      {!isPlayerJoined ? (
        <button
          onClick={handleToggle}
          disabled={isDisabled || isLoading}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex-shrink-0 whitespace-nowrap flex items-center gap-2 ${
            isDisabled || isLoading
              ? 'bg-slate-600 text-slate-300 cursor-not-allowed opacity-50'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isLoading && <span className="inline-block animate-spin">⟳</span>}
          {!isLoading && de.common.join}
        </button>
      ) : (
        <button
          onClick={handleToggle}
          disabled={isDisabled || isLoading}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex-shrink-0 whitespace-nowrap flex items-center gap-2 ${
            isDisabled
              ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 text-white'
          } ${isDisabled || isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {isLoading && <span className="inline-block animate-spin">⟳</span>}
          {!isLoading && de.common.withdraw}
        </button>
      )}
    </div>
  )
}
