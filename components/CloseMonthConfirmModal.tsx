'use client'

import { de } from '@/lib/i18n'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  costAmount: number
}

export default function CloseMonthConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  costAmount,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="card max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">⚠️ Monat abschließen</h2>

        <div className="space-y-4 mb-6">
          <p className="text-slate-300">Haben Sie alles ausgewählt?</p>

          <div className="bg-slate-700/50 rounded p-3 border border-slate-600">
            <p className="text-sm text-slate-400 mb-1">Ihre Gesamtkosten</p>
            <p className="text-2xl font-bold text-emerald-400">€{costAmount.toFixed(2)}</p>
          </div>

          <p className="text-sm text-slate-400">
            Nach dem Abschließen müssen Sie die Zahlungsart wählen und bezahlen.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary flex-1"
          >
            Abschließen und Zahlen
          </button>
        </div>
      </div>
    </div>
  )
}
