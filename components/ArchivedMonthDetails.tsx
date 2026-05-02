'use client'

import { Month, User } from '@/lib/types'
import { formatDate, formatMonth } from '@/lib/dateUtils'
import { formatPrice } from '@/lib/pricingUtils'
import { de } from '@/lib/i18n'
import { useState } from 'react'

interface Props {
  month: Month
  users: User[]
}

export default function ArchivedMonthDetails({ month, users }: Props) {
  const [expanded, setExpanded] = useState(false)

  const sortedPlayers = users
    .map(user => ({
      user,
      payment: month.playerStatus.get(user.id),
      gamesJoined: month.playDays.filter(pd => pd.playersJoined.includes(user.id)).length,
      playDays: month.playDays.filter(pd => pd.playersJoined.includes(user.id)),
    }))
    .filter(item => item.payment)
    .sort((a, b) => {
      const statusOrder = { open: 0, editing: 1, committed: 2, payment_submitted: 3, confirmed: 4, unpaid: 5 }
      return statusOrder[a.payment!.status] - statusOrder[b.payment!.status]
    })

  const statusColors: { [key: string]: string } = {
    open: 'bg-slate-500/20 border-slate-500 text-slate-300',
    editing: 'bg-blue-500/20 border-blue-500 text-blue-300',
    committed: 'bg-orange-500/20 border-orange-500 text-orange-300',
    payment_submitted: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    confirmed: 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
    unpaid: 'bg-red-500/20 border-red-500 text-red-300',
  }

  const statusLabels: { [key: string]: string } = {
    open: de.payments.openStatus,
    editing: de.payments.editingStatus,
    committed: de.payments.committedStatus,
    payment_submitted: de.payments.paymentSubmittedStatus,
    confirmed: de.payments.confirmedStatus,
    unpaid: de.payments.unpaidStatus,
  }

  return (
    <div className="card border-l-4 border-l-cyan-600">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center justify-between hover:opacity-75 transition-opacity"
      >
        <div>
          <h3 className="text-lg font-bold text-white">{formatMonth(month.year, month.month)}</h3>
          <p className="text-xs text-slate-400">Abgeschlossen • {sortedPlayers.length} Spieler</p>
        </div>
        <span className="badge bg-cyan-900 text-cyan-200 text-xs">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-slate-700 pt-4">
          {sortedPlayers.map(({ user, payment, gamesJoined, playDays }) => (
            <div key={user.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">
                    {gamesJoined} {gamesJoined === 1 ? 'Spiel' : 'Spiele'} • {formatPrice(payment!.costAmount)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded border text-xs font-semibold ${statusColors[payment!.status]}`}>
                  {statusLabels[payment!.status]}
                </span>
              </div>

              {playDays.length > 0 && (
                <div className="ml-4 text-sm space-y-1">
                  {playDays.map(pd => (
                    <div key={pd.id} className="text-slate-400">
                      • {formatDate(pd.date)}
                    </div>
                  ))}
                </div>
              )}

              {payment!.paymentMethod && (
                <div className="ml-4 text-xs text-slate-500">
                  {de.payments.bankTransfer === payment!.paymentMethod ? 'Banküberweisung' : 'PayPal'}
                </div>
              )}
            </div>
          ))}

          <div className="border-t border-slate-700 pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Gesamte Courts</p>
                <p className="text-lg font-bold text-white">
                  {Math.max(...month.playDays.map(pd => pd.courtsRequired), 0)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Gesamtkostensammlung</p>
                <p className="text-lg font-bold text-emerald-400">
                  {formatPrice(
                    Array.from(month.playerStatus.values()).reduce((sum, p) => sum + p.costAmount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
