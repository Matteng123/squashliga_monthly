'use client'

import { useState } from 'react'
import { calculateBreakdown, formatPrice } from '@/lib/pricingUtils'
import { MonthPlayerStatus, PaymentMethod } from '@/lib/types'
import { de } from '@/lib/i18n'
import PaymentInfoModal from './PaymentInfoModal'

interface Props {
  gamesJoined: number
  status: MonthPlayerStatus
  onCommitMonth?: () => void
  onSelectPaymentMethod?: () => void
  costAmount: number
  onShowCloseConfirm?: () => void
  paymentMethod?: PaymentMethod
  bankAccountName: string
  bankAccountIBAN: string
  paypalLink: string
}

const statusConfig: { [key in MonthPlayerStatus]: { label: string; color: string; badge: string } } = {
  open: { label: de.payments.openStatus, color: 'text-slate-400', badge: 'bg-slate-500/20 border-slate-500' },
  editing: { label: de.payments.editingStatus, color: 'text-blue-400', badge: 'bg-blue-500/20 border-blue-500' },
  committed: { label: de.payments.committedStatus, color: 'text-orange-400', badge: 'bg-orange-500/20 border-orange-500' },
  payment_submitted: { label: de.payments.paymentSubmittedStatus, color: 'text-yellow-400', badge: 'bg-yellow-500/20 border-yellow-500' },
  confirmed: { label: de.payments.confirmedStatus, color: 'text-emerald-400', badge: 'bg-emerald-500/20 border-emerald-500' },
  unpaid: { label: de.payments.unpaidStatus, color: 'text-red-400', badge: 'bg-red-500/20 border-red-500' },
}

export default function PaymentSummary({
  gamesJoined,
  status,
  onCommitMonth,
  onSelectPaymentMethod,
  costAmount,
  onShowCloseConfirm,
  paymentMethod,
  bankAccountName,
  bankAccountIBAN,
  paypalLink,
}: Props) {
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const breakdown = calculateBreakdown(gamesJoined)
  const config = statusConfig[status]

  return (
    <div className="card sticky bottom-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 rounded-none">
      <div className="space-y-3">
        {status === 'payment_submitted' && (
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-3 py-2">
            <p className="text-sm font-semibold text-yellow-300">
              ⏳ Zahlung wird geprüft
            </p>
            <p className="text-xs text-yellow-200/80 mt-0.5">
              Du bekommst eine Bestätigungsmail sobald alles abgeschlossen ist.
            </p>
          </div>
        )}

        {status === 'confirmed' && (
          <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2">
            <p className="text-sm font-semibold text-emerald-300">
              ✓ Zahlung bestätigt
            </p>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Eine detaillierte Bestätigungsmail wurde an dich gesendet.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">{de.payments.baseFee}</p>
            <p className="text-lg font-bold text-white">{formatPrice(breakdown.baseFee)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">{de.common.games}</p>
            <p className="text-lg font-bold text-white">{gamesJoined} × {formatPrice(5)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">{de.payments.totalCost}</p>
            <p className="text-2xl font-bold text-emerald-400">{formatPrice(breakdown.total)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className={`px-3 py-1 rounded border ${config.badge}`}>
            <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
          </div>

          {status === 'editing' && onShowCloseConfirm && gamesJoined > 0 && (
            <button
              onClick={onShowCloseConfirm}
              className="btn-primary text-sm px-3 py-1"
            >
              {de.payments.payMonth}
            </button>
          )}

          {(status === 'open' || status === 'editing') && gamesJoined === 0 && (
            <p className="text-sm text-slate-500">Select at least one game...</p>
          )}

          {status === 'committed' && !paymentMethod && onSelectPaymentMethod && (
            <button
              onClick={onSelectPaymentMethod}
              className="btn-secondary text-sm px-3 py-1"
            >
              {de.payments.choosePaymentMethod}
            </button>
          )}

          {status === 'payment_submitted' && paymentMethod && (
            <button
              onClick={() => setShowPaymentInfo(true)}
              className="btn-secondary text-sm px-3 py-1"
            >
              {de.payments.paymentInfo}
            </button>
          )}

          {status === 'confirmed' && (
            <p className="text-sm text-emerald-300">{de.payments.paymentConfirmed}</p>
          )}

          {status === 'unpaid' && (
            <p className="text-sm text-red-300">⚠️ Nicht bezahlt</p>
          )}
        </div>
      </div>

      <PaymentInfoModal
        isOpen={showPaymentInfo}
        onClose={() => setShowPaymentInfo(false)}
        paymentMethod={paymentMethod as 'bank_transfer' | 'paypal' | undefined}
        bankAccountName={bankAccountName}
        bankAccountIBAN={bankAccountIBAN}
        paypalLink={paypalLink}
        costAmount={costAmount}
      />
    </div>
  )
}
