'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { de } from '@/lib/i18n'

interface Props {
  isOpen: boolean
  onClose: () => void
  paymentMethod?: 'bank_transfer' | 'paypal'
  bankAccountName: string
  bankAccountIBAN: string
  paypalLink: string
  costAmount: number
}

export default function PaymentInfoModal({
  isOpen,
  onClose,
  paymentMethod,
  bankAccountName,
  bankAccountIBAN,
  paypalLink,
  costAmount,
}: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 overflow-y-auto">
      <div className="card max-w-md w-full my-8">
        <h2 className="text-xl font-bold text-white mb-4">{de.payments.paymentInfo}</h2>

        {paymentMethod === 'bank_transfer' && (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">{de.payments.transferInstructions}</p>

            <div className="bg-slate-700/50 rounded p-4 border border-slate-600 space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">{de.payments.accountName}</p>
                <p className="text-sm font-semibold text-white">{bankAccountName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">{de.payments.iban}</p>
                <p className="text-sm font-mono text-emerald-400 break-all">{bankAccountIBAN}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Betrag</p>
                <p className="text-sm font-semibold text-white">€{costAmount.toFixed(2)}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Verwenden Sie die Referenz in der Betreffzeile, damit wir Ihre Zahlung zuordnen können.
            </p>
          </div>
        )}

        {paymentMethod === 'paypal' && (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">{de.payments.paypalInstructions}</p>

            <div className="bg-slate-700/50 rounded p-4 border border-slate-600">
              <p className="text-xs text-slate-500 mb-2">Betrag</p>
              <p className="text-2xl font-bold text-emerald-400">€{costAmount.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-3 mb-3">PayPal Link:</p>
              <p className="text-xs text-slate-300 break-all">{paypalLink}</p>
            </div>

            <a
              href={paypalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center block"
            >
              {de.payments.payPerPayPal}
            </a>
          </div>
        )}

        <button
          onClick={onClose}
          className="btn-secondary w-full mt-6"
        >
          {de.payments.cancel}
        </button>
      </div>
    </div>,
    document.body
  )
}
