'use client'

import { calculateBreakdown, formatPrice } from '@/lib/pricingUtils'

interface Props {
  gamesJoined: number
}

export default function CostSummary({ gamesJoined }: Props) {
  const breakdown = calculateBreakdown(gamesJoined)

  return (
    <div className="card sticky bottom-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 rounded-none">
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
    </div>
  )
}
