'use client'

import { Month, User, MonthPlayerStatus, PlayerMonthPayment } from '@/lib/types'
import { formatPrice } from '@/lib/pricingUtils'

interface Props {
  month: Month
  users: User[]
  onMarkConfirmed: (userId: string) => void
}

const statusColors: { [key in MonthPlayerStatus]: string } = {
  editing: 'bg-blue-500/20 border-blue-500 text-blue-300',
  committed: 'bg-orange-500/20 border-orange-500 text-orange-300',
  self_paid: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
  confirmed: 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
}

const statusLabels: { [key in MonthPlayerStatus]: string } = {
  editing: 'Editing',
  committed: 'Committed',
  self_paid: 'Self Paid',
  confirmed: 'Confirmed',
}

export default function PaymentStatusTable({
  month,
  users,
  onMarkConfirmed,
}: Props) {
  const sortedPlayers = users
    .map(user => ({
      user,
      payment: month.playerStatus.get(user.id),
    }))
    .filter(item => item.payment)
    .sort((a, b) => {
      const statusOrder = { editing: 0, committed: 1, self_paid: 2, confirmed: 3 }
      return statusOrder[a.payment!.status] - statusOrder[b.payment!.status]
    })

  if (sortedPlayers.length === 0) {
    return (
      <div className="card text-center py-8 text-slate-400">
        No players in this month.
      </div>
    )
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-600">
            <th className="text-left py-3 px-4 font-semibold text-slate-300">Player</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-300">Cost</th>
            <th className="text-center py-3 px-4 font-semibold text-slate-300">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-300">Method</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-300">Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map(({ user, payment }) => (
            <tr
              key={user.id}
              className="border-b border-slate-700 hover:bg-slate-800/50"
            >
              <td className="py-3 px-4 font-medium text-white">{user.name}</td>
              <td className="py-3 px-4 text-right text-white font-semibold">
                {formatPrice(payment!.costAmount)}
              </td>
              <td className="py-3 px-4">
                <div className="inline-block">
                  <span className={`px-3 py-1 rounded border text-xs font-semibold ${statusColors[payment!.status]}`}>
                    {statusLabels[payment!.status]}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-slate-400">
                {payment!.paymentMethod ? (
                  <span className="capitalize">
                    {payment!.paymentMethod.replace('_', ' ')}
                  </span>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                {payment!.status === 'self_paid' && (
                  <button
                    onClick={() => onMarkConfirmed(user.id)}
                    className="btn-secondary text-xs px-2 py-1"
                  >
                    Confirm
                  </button>
                )}
                {payment!.status !== 'self_paid' && (
                  <span className="text-slate-600">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
