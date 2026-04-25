'use client'

import { useState } from 'react'
import { PaymentMethod } from '@/lib/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (method: PaymentMethod) => void
  selectedMethod?: PaymentMethod
}

const methods: { value: PaymentMethod; label: string; description: string }[] = [
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Direct bank transfer',
  },
  {
    value: 'cash',
    label: 'Cash',
    description: 'Payment in cash',
  },
  {
    value: 'card',
    label: 'Card',
    description: 'Credit or debit card',
  },
]

export default function PaymentMethodSelector({
  isOpen,
  onClose,
  onConfirm,
  selectedMethod,
}: Props) {
  const [selected, setSelected] = useState<PaymentMethod | undefined>(selectedMethod)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="card max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Select Payment Method</h2>
        <p className="text-slate-300 text-sm mb-6">How would you like to pay?</p>

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

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancel
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
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
