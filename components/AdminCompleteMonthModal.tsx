'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  isOpen: boolean
  monthLabel: string
  onClose: () => void
  onConfirm: () => void
}

export default function AdminCompleteMonthModal({ isOpen, monthLabel, onClose, onConfirm }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="card max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-3">Archive Month</h2>
        <p className="text-slate-300 text-sm mb-3">
          <strong className="text-white">{monthLabel}</strong> will be archived. This cannot be undone.
        </p>
        <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-3 mb-6 text-sm text-orange-300">
          ⚠️ Make sure all payments have been confirmed before archiving. Players with <em>committed</em> or <em>pending</em> status will be marked as <strong>unpaid</strong>.
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="btn-primary flex-1">Archive Month</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
