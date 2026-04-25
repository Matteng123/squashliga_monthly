'use client'

import useAppStore from '@/lib/store'
import { formatDate } from '@/lib/dateUtils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
      <h3 className="font-semibold text-white mb-3">⏰ Time Simulation</h3>

      <div className="bg-slate-900 rounded p-3 text-center">
        <p className="text-xs text-slate-500 mb-1">Current Date</p>
        <p className="font-mono text-lg font-bold text-white">{formatDate(currentDate)}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={handlePrevDay} className="btn-secondary flex-1">
          <ChevronLeft size={16} className="inline mr-1" />
          Previous Day
        </button>
        <button onClick={handleTodayClick} className="btn-secondary flex-1">
          Today
        </button>
        <button onClick={handleNextDay} className="btn-secondary flex-1">
          Next Day
          <ChevronRight size={16} className="inline ml-1" />
        </button>
      </div>

      <div className="divider" />

      <p className="text-xs text-slate-400 font-semibold">Quick Jump</p>

      {currentMonth && (
        <button onClick={jumpToDeadline} className="btn-accent w-full text-sm">
          → Jump to Deadline ({formatDate(currentMonth.deadlineDate)})
        </button>
      )}

      {nextMonth && (
        <button onClick={jumpToReminderDay} className="btn-primary w-full text-sm">
          → Jump to Reminder ({formatDate(nextMonth.reminderDate)})
        </button>
      )}

      <p className="text-xs text-slate-500 pt-2">
        💡 Trigger deadline and reminder emails by jumping to those dates. Check the Mail Center to see
        generated emails.
      </p>
    </div>
  )
}
