'use client'

import { useEffect, useState } from 'react'
import useAppStore from '@/lib/store'
import RoleSelector from '@/components/RoleSelector'
import Header from '@/components/Header'
import MonthSelector from '@/components/MonthSelector'
import PlayDayCard from '@/components/PlayDayCard'
import CostSummary from '@/components/CostSummary'
import LeagueSettingsForm from '@/components/LeagueSettingsForm'
import AdminSummaryCard from '@/components/AdminSummaryCard'
import TimeSimControls from '@/components/TimeSimControls'
import MailCenter from '@/components/MailCenter'

export default function Home() {
  const currentUser = useAppStore(s => s.currentUser)
  const currentUserId = useAppStore(s => s.currentUserId)
  const months = useAppStore(s => s.months)
  const setCurrentUser = useAppStore(s => s.setCurrentUser)
  const users = useAppStore(s => s.users)
  const currentMonth = useAppStore(s => s.currentMonth)
  const currentDate = useAppStore(s => s.currentDate)
  const leagueSettings = useAppStore(s => s.leagueSettings)
  const togglePlayDay = useAppStore(s => s.togglePlayDay)
  const initApp = useAppStore(s => s.initApp)
  const [selectedMonth, setSelectedMonth] = useState<any>(null)
  const [page, setPage] = useState<'role' | 'player' | 'admin' | 'mail'>('role')


  useEffect(() => {
    if (months.length === 0) {
      initApp()
    }
  }, [months.length, initApp])

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'player') {
        setPage('player')
      } else {
        setPage('admin')
      }
    } else {
      setPage('role')
    }
  }, [currentUser])

  useEffect(() => {
    if (currentMonth && !selectedMonth) {
      setSelectedMonth(currentMonth)
    }
  }, [currentMonth, selectedMonth])

  if (!currentUserId || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-2">🏸 Squash League</h1>
            <p className="text-slate-400">Monthly casual league management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card border-2 border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-emerald-400">Player</h2>
              <div className="space-y-2 mb-6">
                {users
                  .filter(u => u.role === 'player')
                  .map(player => (
                    <button
                      key={player.id}
                      onClick={() => {
                        setCurrentUser(player.id)
                        setPage('player')
                      }}
                      className="btn-secondary w-full text-left"
                    >
                      {player.name}
                    </button>
                  ))}
              </div>
              <p className="text-sm text-slate-400">Join play days • Track costs • View schedule</p>
            </div>

            <div className="card border-2 border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-orange-400">Admin</h2>
              {users.find(u => u.role === 'admin') && (
                <button
                  onClick={() => {
                    const admin = users.find(u => u.role === 'admin')
                    if (admin) {
                      setCurrentUser(admin.id)
                      setPage('admin')
                    }
                  }}
                  className="btn-secondary w-full mb-6"
                >
                  {users.find(u => u.role === 'admin')?.name}
                </button>
              )}
              <p className="text-sm text-slate-400">Configure league • View participation • Review emails</p>
            </div>
          </div>

          <div className="mt-12 text-center text-slate-500 text-sm">
            <p>This is a prototype. No real authentication or data persistence.</p>
          </div>
        </div>
      </div>
    )
  }

  if (page === 'role') {
    return <RoleSelector />
  }

  if (page === 'player') {
    if (!selectedMonth) {
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

          <button
            onClick={() => setPage('mail')}
            className="btn-secondary w-full"
          >
            📬 Mail Center
          </button>
        </main>

        <CostSummary gamesJoined={gamesJoined} />
      </div>
    )
  }

  if (page === 'admin') {
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

            <div className="space-y-4">
              <TimeSimControls />
              <button
                onClick={() => setPage('mail')}
                className="btn-secondary w-full"
              >
                📬 Mail Center
              </button>
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

  if (page === 'mail') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Header />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          <button onClick={() => setPage(currentUser.role === 'player' ? 'player' : 'admin')} className="btn-secondary mb-6">
            ← Back
          </button>

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
        </main>
      </div>
    )
  }

  return null
}
