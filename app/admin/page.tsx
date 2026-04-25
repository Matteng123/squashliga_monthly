'use client'

import { useEffect } from 'react'
import useAppStore from '@/lib/store'
import Header from '@/components/Header'
import LeagueSettingsForm from '@/components/LeagueSettingsForm'
import AdminSummaryCard from '@/components/AdminSummaryCard'
import TimeSimControls from '@/components/TimeSimControls'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminPage() {
  const currentUser = useAppStore(s => s.currentUser)
  const months = useAppStore(s => s.months)
  const leagueSettings = useAppStore(s => s.leagueSettings)
  const currentDate = useAppStore(s => s.currentDate)
  const currentMonth = useAppStore(s => s.currentMonth)
  const initApp = useAppStore(s => s.initApp)
  const router = useRouter()

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/')
      return
    }

    if (months.length === 0) {
      initApp()
    }
  }, [currentUser, router, months.length, initApp])

  if (!currentUser || months.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-orange-600 text-4xl">⏳</div>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  const sortedMonths = [...months].sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime())

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
        <LeagueSettingsForm initialSettings={leagueSettings} />

        <div className="divider" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-white">Monthly Overview</h2>
            {sortedMonths.slice(0, 4).map(month => (
              <AdminSummaryCard
                key={month.id}
                month={month}
                isCurrentMonth={currentMonth?.id === month.id}
                isDeadlinePassed={currentDate >= month.deadlineDate}
              />
            ))}
          </div>

          <div>
            <TimeSimControls />
          </div>
        </div>

        <div className="card bg-slate-700/50 border-slate-600">
          <p className="text-sm text-slate-300 mb-2">💡 Admin Tips:</p>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>✓ Configure league settings (play days, court size, deadlines)</li>
            <li>✓ Use time controls to simulate deadlines and trigger emails</li>
            <li>✓ Check Mail Center to see generated emails</li>
            <li>✓ Settings apply to all future months when saved</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
