'use client'

import { useEffect, useState } from 'react'
import useAppStore from '@/lib/store'
import Header from '@/components/Header'
import MonthSelector from '@/components/MonthSelector'
import PlayDayCard from '@/components/PlayDayCard'
import CostSummary from '@/components/CostSummary'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PlayerPage() {
  const currentUser = useAppStore(s => s.currentUser)
  const months = useAppStore(s => s.months)
  const currentMonth = useAppStore(s => s.currentMonth)
  const currentDate = useAppStore(s => s.currentDate)
  const togglePlayDay = useAppStore(s => s.togglePlayDay)
  const initApp = useAppStore(s => s.initApp)
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState<any>(null)

  useEffect(() => {
    if (!currentUser) {
      router.push('/')
      return
    }

    if (months.length === 0) {
      initApp()
    }
  }, [currentUser, router, months.length, initApp])

  useEffect(() => {
    if (currentMonth && !selectedMonth) {
      setSelectedMonth(currentMonth)
    }
  }, [currentMonth, selectedMonth])

  if (!currentUser || !selectedMonth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-orange-600 text-4xl">⏳</div>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  const gamesJoined = selectedMonth.playDays.filter((pd: any) =>
    pd.playersJoined.includes(currentUser.id),
  ).length

  const isMonthLocked = currentDate >= selectedMonth.deadlineDate

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col pb-40">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="card bg-gradient-to-r from-orange-600/20 to-emerald-600/20 border-orange-600/50">
          <p className="text-slate-300 text-sm">
            {isMonthLocked ? (
              <>
                🔒 <span className="font-semibold">This month is locked</span> – no further changes allowed.
              </>
            ) : (
              <>
                ✓ <span className="font-semibold">Selection open</span> – join or leave play days.
              </>
            )}
          </p>
        </div>

        <MonthSelector
          months={months}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
        />

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Play Days</h2>
          {selectedMonth.playDays.length === 0 ? (
            <div className="card text-center py-8 text-slate-400">
              No play days scheduled for this month.
            </div>
          ) : (
            selectedMonth.playDays.map((playDay: any) => (
              <PlayDayCard
                key={playDay.id}
                playDay={playDay}
                monthId={selectedMonth.id}
                isPlayerJoined={playDay.playersJoined.includes(currentUser.id)}
                isLocked={isMonthLocked}
                onToggle={() => togglePlayDay(selectedMonth.id, playDay.id)}
              />
            ))
          )}
        </div>

        <div className="card bg-slate-700/50 border-slate-600">
          <p className="text-sm text-slate-300 mb-2">💡 Tip: Join games to see your cost update below.</p>
          <p className="text-xs text-slate-400">
            Base fee is always €20. Each game you join adds €5.
          </p>
        </div>
      </main>

      <CostSummary gamesJoined={gamesJoined} />
    </div>
  )
}
