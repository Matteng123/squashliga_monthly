'use client'

import { Month, MonthPlayerStatus } from '@/lib/types'
import { formatMonth } from '@/lib/dateUtils'
import { formatPrice, calculateCost } from '@/lib/pricingUtils'
import { de } from '@/lib/i18n'

interface Props {
  months: Month[]
  currentDate: Date
  selectedMonth: Month | null
  currentUserId: string
  onSelectMonth: (month: Month) => void
}

const statusConfig: { [key in MonthPlayerStatus]: { label: string; color: string; icon: string } } = {
  open: {
    label: de.payments.openStatus,
    color: 'bg-blue-500/20 border-blue-500 text-blue-300',
    icon: '✏️',
  },
  committed: {
    label: de.payments.committedStatus,
    color: 'bg-orange-500/20 border-orange-500 text-orange-300',
    icon: '🔒',
  },
  payment_submitted: {
    label: de.payments.paymentSubmittedStatus,
    color: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    icon: '⏳',
  },
  confirmed: {
    label: de.payments.confirmedStatus,
    color: 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
    icon: '✓',
  },
  unpaid: {
    label: de.payments.unpaidStatus,
    color: 'bg-red-500/20 border-red-500 text-red-300',
    icon: '⚠️',
  },
}

export default function PlayerCycleOverview({
  months,
  currentDate,
  selectedMonth,
  currentUserId,
  onSelectMonth,
}: Props) {
  // Get the current 3-month cycle starting from the current month
  const sortedMonths = [...months].sort(
    (a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime(),
  )

  // Find the current month index
  const currentMonthIndex = sortedMonths.findIndex(
    m => m.year === currentDate.getFullYear() && m.month === currentDate.getMonth(),
  )

  // Get 3 months starting from current month (or from beginning if no current match)
  const startIndex = currentMonthIndex >= 0 ? currentMonthIndex : 0
  const cycleMonths = sortedMonths.slice(startIndex, startIndex + 3)

  if (cycleMonths.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">📅 Zyklus</h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {cycleMonths.map(month => {
          const playerPayment = month.playerStatus.get(currentUserId)
          const status: MonthPlayerStatus = playerPayment?.status || 'open'
          const gamesJoined = month.playDays.filter(pd =>
            pd.playersJoined.includes(currentUserId),
          ).length
          const costAmount = playerPayment?.costAmount || calculateCost(gamesJoined)
          const isSelected = selectedMonth?.id === month.id
          const isCurrent =
            month.year === currentDate.getFullYear() && month.month === currentDate.getMonth()
          const monthShort = new Intl.DateTimeFormat('de-DE', { month: 'short' }).format(
            new Date(month.year, month.month),
          )
          const yearShort = String(month.year).slice(2)

          return (
            <button
              key={month.id}
              onClick={() => onSelectMonth(month)}
              className={`rounded-lg p-2 text-left transition-all border-2 ${
                isSelected
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <h3 className="text-sm font-bold text-white mb-1.5">
                {isCurrent && '⭐ '}
                {monthShort} '{yearShort}
              </h3>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{gamesJoined} Sp.</span>
                <span className="text-emerald-400 font-bold">{formatPrice(costAmount)}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
