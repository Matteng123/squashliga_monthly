'use client'

import { useState } from 'react'
import { PaymentMethod } from '@/lib/types'
import { de } from '@/lib/i18n'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (method: PaymentMethod) => void
  selectedMethod?: PaymentMethod
  bankAccountName: string
  bankAccountIBAN: string
  paypalLink: string
  costAmount: number
}

const methods: { value: PaymentMethod; label: string; description: string }[] = [
  {
    value: 'bank_transfer',
    label: de.payments.bankTransfer,
    description: de.payments.bankTransferDesc,
  },
  {
    value: 'paypal',
    label: de.payments.paypal,
    description: de.payments.paypalDesc,
  },
]

export default function PaymentMethodSelector({
  isOpen,
  onClose,
  onConfirm,
  selectedMethod,
  bankAccountName,
  bankAccountIBAN,
  paypalLink,
  costAmount,
}: Props) {
  const [selected, setSelected] = useState<PaymentMethod | undefined>(selectedMethod)
  const [showDetails, setShowDetails] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="card max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">{de.payments.selectPaymentMethod}</h2>
        <p className="text-slate-300 text-sm mb-6">{de.payments.choosePaymentMethod}</p>

        <div className="space-y-3 mb-6">
          {methods.map(method => (
            <label
              key={method.value}
              className="flex items-center p-3 rounded border border-slate-600 hover:border-slate-500 cursor-pointer hover:bg-slate-800/50"
            >
              <input
                type="radio"
                name="payment-method"
                value={method.value}
                checked={selected === method.value}
                onChange={e => setSelected(e.target.value as PaymentMethod)}
                className="mr-3"
              />
              <div className="flex-1">
                <p className="font-semibold text-white">{method.label}</p>
                <p className="text-xs text-slate-400">{method.description}</p>
              </div>
            </label>
          ))}
        </div>

        {selected === 'bank_transfer' && (
          <div className="bg-slate-700/50 rounded p-3 mb-6 border border-slate-600 space-y-2 text-xs">
            <p className="text-slate-400">{de.payments.transferInstructions}</p>
            <div className="space-y-1">
              <p className="text-slate-500">{de.payments.accountName}: <span className="text-white font-semibold">{bankAccountName}</span></p>
              <p className="text-slate-500">{de.payments.iban}: <span className="text-emerald-400 font-mono break-all">{bankAccountIBAN}</span></p>
              <p className="text-slate-500">Betrag: <span className="text-white font-semibold">€{costAmount.toFixed(2)}</span></p>
            </div>
          </div>
        )}

        {selected === 'paypal' && (
          <div className="bg-slate-700/50 rounded p-3 mb-6 border border-slate-600 space-y-2 text-xs">
            <p className="text-slate-400">{de.payments.paypalInstructions}</p>
            <p className="text-slate-500">Betrag: <span className="text-white font-semibold">€{costAmount.toFixed(2)}</span></p>
            <p className="text-slate-500 break-all">Link: <span className="text-blue-400">{paypalLink}</span></p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            {de.payments.cancel}
          </button>
          <button
            onClick={() => {
              if (selected) {
                onConfirm(selected)
                onClose()
              }
            }}
            disabled={!selected}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {de.payments.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
