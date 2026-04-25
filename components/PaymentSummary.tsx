'use client'

import { calculateBreakdown, formatPrice } from '@/lib/pricingUtils'
import { MonthPlayerStatus } from '@/lib/types'

interface Props {
  gamesJoined: number
  status: MonthPlayerStatus
  onCommitMonth?: () => void
  onSelectPaymentMethod?: () => void
  costAmount: number
}

const statusConfig = {
  editing: { label: 'Editing', color: 'text-blue-400', badge: 'bg-blue-500/20 border-blue-500' },
  committed: { label: 'Committed', color: 'text-orange-400', badge: 'bg-orange-500/20 border-orange-500' },
  self_paid: { label: 'Awaiting Confirmation', color: 'text-yellow-400', badge: 'bg-yellow-500/20 border-yellow-500' },
  confirmed: { label: 'Confirmed', color: 'text-emerald-400', badge: 'bg-emerald-500/20 border-emerald-500' },
}

export default function PaymentSummary({
  gamesJoined,
  status,
  onCommitMonth,
  onSelectPaymentMethod,
  costAmount,
}: Props) {
  const breakdown = calculateBreakdown(gamesJoined)
  const config = statusConfig[status]

  return (
    <div className="card sticky bottom-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 rounded-none">
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Base Fee</p>
            <p className="text-lg font-bold text-white">{formatPrice(breakdown.baseFee)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Games</p>
            <p className="text-lg font-bold text-white">{gamesJoined} × {formatPrice(5)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-emerald-400">{formatPrice(breakdown.total)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className={`px-3 py-1 rounded border ${config.badge}`}>
            <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
          </div>

          {status === 'editing' && onCommitMonth && (
            <button
              onClick={onCommitMonth}
              className="btn-secondary text-sm px-3 py-1 opacity-75 hover:opacity-100"
            >
              Commit Month
            </button>
          )}

          {status === 'committed' && onSelectPaymentMethod && (
            <button
              onClick={onSelectPaymentMethod}
              className="btn-secondary text-sm px-3 py-1"
            >
              Choose Payment Method
            </button>
          )}

          {status === 'self_paid' && (
            <p className="text-sm text-yellow-300">⏳ Awaiting admin confirmation</p>
          )}

          {status === 'confirmed' && (
            <p className="text-sm text-emerald-300">✓ Payment confirmed</p>
          )}
        </div>
      </div>
    </div>
  )
}
