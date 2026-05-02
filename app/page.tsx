'use client'

import { useEffect, useState } from 'react'
import useAppStore from '@/lib/store'
import RoleSelector from '@/components/RoleSelector'
import Header from '@/components/Header'
import MonthSelector from '@/components/MonthSelector'
import PlayerCycleOverview from '@/components/PlayerCycleOverview'
import PlayDayCard from '@/components/PlayDayCard'
import PaymentSummary from '@/components/PaymentSummary'
import PaymentMethodSelector from '@/components/PaymentMethodSelector'
import LeagueSettingsForm from '@/components/LeagueSettingsForm'
import AdminSummaryCard from '@/components/AdminSummaryCard'
import TimeSimControls from '@/components/TimeSimControls'
import MailCenter from '@/components/MailCenter'
import CloseMonthConfirmModal from '@/components/CloseMonthConfirmModal'
import ArchivedMonthDetails from '@/components/ArchivedMonthDetails'
import { PaymentMethod, MonthPlayerStatus } from '@/lib/types'
import { calculateCost } from '@/lib/pricingUtils'
import { formatMonth } from '@/lib/dateUtils'
import { de } from '@/lib/i18n'

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
  const commitMonth = useAppStore(s => s.commitMonth)
  const completeMonth = useAppStore(s => s.completeMonth)
  const setPaymentMethod = useAppStore(s => s.setPaymentMethod)
  const recordPayment = useAppStore(s => s.recordPayment)
  const markPaymentConfirmed = useAppStore(s => s.markPaymentConfirmed)
  const autoCommitUnfinishedMonths = useAppStore(s => s.autoCommitUnfinishedMonths)
  const [selectedMonth, setSelectedMonth] = useState<any>(null)
  const [page, setPage] = useState<'role' | 'player' | 'admin' | 'mail'>('role')
  const [showPaymentMethodSelector, setShowPaymentMethodSelector] = useState(false)
  const [showCloseMonthConfirm, setShowCloseMonthConfirm] = useState(false)

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

  useEffect(() => {
    if (selectedMonth) {
      const updatedMonth = months.find(m => m.id === selectedMonth.id)
      if (updatedMonth && updatedMonth !== selectedMonth) {
        setSelectedMonth(updatedMonth)
      }
    }
  }, [months, selectedMonth])

  useEffect(() => {
    if (page === 'player' && selectedMonth && currentDate >= selectedMonth.deadlineDate) {
      const playerPaymentStatus = selectedMonth.playerStatus.get(currentUserId || '')
      if (playerPaymentStatus?.status === 'open') {
        autoCommitUnfinishedMonths(selectedMonth.id)
      }
    }
  }, [page, selectedMonth, currentDate, currentUserId, autoCommitUnfinishedMonths])

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
    const playerPaymentStatus = selectedMonth.playerStatus.get(currentUser.id)
    const paymentStatus: MonthPlayerStatus = playerPaymentStatus?.status || 'open'
    const costAmount = playerPaymentStatus?.costAmount || calculateCost(gamesJoined)

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col pb-40">
        <Header onMailClick={() => setPage('mail')} />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
          <div className="card bg-gradient-to-r from-orange-600/20 to-emerald-600/20 border-orange-600/50">
            <p className="text-slate-300 text-sm">
              <span className="font-semibold">
                {isMonthLocked ? de.player.selectionLocked : de.player.selectionOpen}
              </span>
            </p>
          </div>

          <PlayerCycleOverview
            months={months}
            currentDate={currentDate}
            selectedMonth={selectedMonth}
            currentUserId={currentUser.id}
            onSelectMonth={setSelectedMonth}
          />

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">
              {de.player.playDaysTitle} – {formatMonth(selectedMonth.year, selectedMonth.month)}
            </h2>
            {selectedMonth.playDays.length === 0 ? (
              <div className="card text-center py-8 text-slate-400">
                {de.player.noPlayDays}
              </div>
            ) : (
              selectedMonth.playDays.map((playDay: any) => (
                <PlayDayCard
                  key={playDay.id}
                  playDay={playDay}
                  monthId={selectedMonth.id}
                  isPlayerJoined={playDay.playersJoined.includes(currentUser.id)}
                  isLocked={isMonthLocked}
                  isMonthCommitted={paymentStatus !== 'open' && paymentStatus !== 'editing'}
                  paymentStatus={paymentStatus}
                  onToggle={() => togglePlayDay(selectedMonth.id, playDay.id)}
                />
              ))
            )}
          </div>

          <div className="card bg-slate-700/50 border-slate-600">
            <p className="text-sm text-slate-300 mb-2">{de.player.tip}</p>
            <p className="text-xs text-slate-400">
              {de.player.baseFeeTip}
            </p>
          </div>

          <button
            onClick={() => setPage('mail')}
            className="btn-secondary w-full"
          >
            {de.player.mailCenter}
          </button>
        </main>

        <PaymentSummary
          gamesJoined={gamesJoined}
          status={paymentStatus}
          costAmount={costAmount}
          onShowCloseConfirm={() => setShowCloseMonthConfirm(true)}
          onSelectPaymentMethod={() => setShowPaymentMethodSelector(true)}
          paymentMethod={playerPaymentStatus?.paymentMethod}
          bankAccountName={leagueSettings.bankAccountName}
          bankAccountIBAN={leagueSettings.bankAccountIBAN}
          paypalLink={leagueSettings.paypalLink}
        />

        <CloseMonthConfirmModal
          isOpen={showCloseMonthConfirm}
          costAmount={costAmount}
          onClose={() => setShowCloseMonthConfirm(false)}
          onConfirm={() => {
            commitMonth(selectedMonth.id, currentUser.id)
            setShowCloseMonthConfirm(false)
            setShowPaymentMethodSelector(true)
          }}
        />

        <PaymentMethodSelector
          isOpen={showPaymentMethodSelector}
          onClose={() => setShowPaymentMethodSelector(false)}
          onConfirm={(method: PaymentMethod) => {
            setPaymentMethod(selectedMonth.id, currentUser.id, method)
            setShowPaymentMethodSelector(false)
          }}
          selectedMethod={playerPaymentStatus?.paymentMethod}
          bankAccountName={leagueSettings.bankAccountName}
          bankAccountIBAN={leagueSettings.bankAccountIBAN}
          paypalLink={leagueSettings.paypalLink}
          costAmount={costAmount}
        />
      </div>
    )
  }

  if (page === 'admin') {
    const sortedMonths = [...months].sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime())
    const activeMonths = sortedMonths.filter(m => m.status === 'active')
    const archivedMonths = sortedMonths.filter(m => m.status === 'archived')

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Header onMailClick={() => setPage('mail')} />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-white">{de.admin.monthlyOverview}</h2>
              {activeMonths.length === 0 ? (
                <div className="card text-center py-8 text-slate-400">Keine aktiven Monate</div>
              ) : (
                activeMonths.map(month => (
                  <AdminSummaryCard
                    key={month.id}
                    month={month}
                    isCurrentMonth={currentMonth?.id === month.id}
                    isDeadlinePassed={currentDate >= month.deadlineDate}
                    onCompleteMonth={() => completeMonth(month.id)}
                    users={users}
                    onMarkConfirmed={(userId: string) => markPaymentConfirmed(month.id, userId)}
                  />
                ))
              )}
            </div>

            <div className="space-y-4">
              <TimeSimControls />
              <button
                onClick={() => setPage('mail')}
                className="btn-secondary w-full"
              >
                {de.player.mailCenter}
              </button>
            </div>
          </div>

          {archivedMonths.length > 0 && (
            <>
              <div className="divider" />
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">📦 Archiv</h2>
                <div className="space-y-3">
                  {archivedMonths.map(month => (
                    <ArchivedMonthDetails key={month.id} month={month} users={users} />
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="divider" />

          <div className="card bg-slate-700/50 border-slate-600">
            <p className="text-sm text-slate-300 mb-2">{de.admin.tips}</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>{de.admin.tip1}</li>
              <li>{de.admin.tip2}</li>
              <li>{de.admin.tip3}</li>
              <li>{de.admin.tip4}</li>
            </ul>
          </div>

          <div className="divider" />

          <LeagueSettingsForm initialSettings={leagueSettings} />
        </main>
      </div>
    )
  }

  if (page === 'mail') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Header onMailClick={() => setPage('mail')} />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          <button onClick={() => setPage(currentUser.role === 'player' ? 'player' : 'admin')} className="btn-secondary mb-6">
            {de.mail.back}
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">{de.mail.title}</h1>
          <p className="text-slate-400 text-sm mb-6">
            {de.mail.subtitle}
          </p>

          <MailCenter />

          <div className="mt-8 card bg-slate-700/50 border-slate-600">
            <p className="text-sm text-slate-300 mb-2">{de.mail.aboutSystemEmails}</p>
            <ul className="text-xs text-slate-400 space-y-2">
              <li><strong>{de.emailTypes.reminder}:</strong> {de.mail.reminderEmail}</li>
              <li><strong>{de.emailTypes.adminSummary}:</strong> {de.mail.adminSummaryEmail}</li>
              <li><strong>{de.emailTypes.booking}:</strong> {de.mail.bookingEmail}</li>
              <li><strong>{de.emailTypes.paymentReminder}:</strong> {de.mail.paymentReminderEmail}</li>
              <li><strong>{de.emailTypes.paymentConfirmation}:</strong> {de.mail.paymentConfirmationEmail}</li>
            </ul>
          </div>
        </main>
      </div>
    )
  }

  return null
}
