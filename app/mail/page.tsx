'use client'

import { useEffect } from 'react'
import useAppStore from '@/lib/store'
import Header from '@/components/Header'
import MailCenter from '@/components/MailCenter'
import { useRouter } from 'next/navigation'

export default function MailPage() {
  const currentUser = useAppStore(s => s.currentUser)
  const initApp = useAppStore(s => s.initApp)
  const months = useAppStore(s => s.months)
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) {
      router.push('/')
      return
    }

    if (months.length === 0) {
      initApp()
    }
  }, [currentUser, router, months.length, initApp])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-orange-600 text-4xl">⏳</div>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <h1 className="text-3xl font-bold text-white mb-2">📬 Mail Center</h1>
        <p className="text-slate-400 text-sm mb-6">
          Simulated emails from the league system. Showing last 3 months.
        </p>

        <MailCenter />

        <div className="mt-8 card bg-slate-700/50 border-slate-600">
          <p className="text-sm text-slate-300 mb-2">💡 About System Emails:</p>
          <ul className="text-xs text-slate-400 space-y-2">
            <li><strong>Player Reminder:</strong> Sent on the reminder day if a player hasn't selected any play days for next month.</li>
            <li><strong>Admin Summary:</strong> Sent immediately after the deadline with full participation details.</li>
            <li><strong>Booking Email:</strong> Clean format for forwarding to Cosmo Sport.</li>
          </ul>
        </div>

        <div className="mt-6 text-center text-slate-500 text-xs">
          <p>Use the time controls in Admin or Player view to trigger emails.</p>
        </div>
      </main>
    </div>
  )
}
