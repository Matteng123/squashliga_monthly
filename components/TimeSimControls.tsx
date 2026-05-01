'use client'

import useAppStore from '@/lib/store'
import { formatDate } from '@/lib/dateUtils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { de } from '@/lib/i18n'

export default function TimeSimControls() {
  const currentDate = useAppStore(s => s.currentDate)
  const currentMonth = useAppStore(s => s.currentMonth)
  const nextMonth = useAppStore(s => s.nextMonth)
  const setCurrentDate = useAppStore(s => s.setCurrentDate)
  const jumpToDeadline = useAppStore(s => s.jumpToDeadline)
  const jumpToReminderDay = useAppStore(s => s.jumpToReminderDay)

  const handlePrevDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const handleTodayClick = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="card space-y-4">
      <h3 className="font-semibold text-white mb-3">⏰ {de.timeSimulation.title}</h3>

      <div className="bg-slate-900 rounded p-3 text-center">
        <p className="text-xs text-slate-500 mb-1">{de.timeSimulation.currentDate}</p>
        <p className="font-mono text-lg font-bold text-white">{formatDate(currentDate)}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={handlePrevDay} className="btn-secondary flex-1">
          <ChevronLeft size={16} className="inline mr-1" />
          Voriger Tag
        </button>
        <button onClick={handleTodayClick} className="btn-secondary flex-1">
          Heute
        </button>
        <button onClick={handleNextDay} className="btn-secondary flex-1">
          Nächster Tag
          <ChevronRight size={16} className="inline ml-1" />
        </button>
      </div>

      <div className="divider" />

      <p className="text-xs text-slate-400 font-semibold">Schneller Sprung</p>

      {currentMonth && (
        <button onClick={jumpToDeadline} className="btn-accent w-full text-sm">
          → {de.timeSimulation.jumpToDeadline} ({formatDate(currentMonth.deadlineDate)})
        </button>
      )}

      {nextMonth && (
        <button onClick={jumpToReminderDay} className="btn-primary w-full text-sm">
          → {de.timeSimulation.jumpToReminderDay} ({formatDate(nextMonth.reminderDate)})
        </button>
      )}

      <p className="text-xs text-slate-500 pt-2">
        💡 Lösen Sie Frist- und Erinnerungs-E-Mails aus, indem Sie zu diesen Daten springen. Überprüfen Sie das Mailcenter, um generierte E-Mails zu sehen.
      </p>
    </div>
  )
}
