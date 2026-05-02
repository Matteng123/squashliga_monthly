'use client'

import { useState } from 'react'
import { LeagueSettings, DayOfWeek } from '@/lib/types'
import useAppStore from '@/lib/store'

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

interface Props {
  initialSettings: LeagueSettings
}

export default function LeagueSettingsForm({ initialSettings }: Props) {
  const updateLeagueSettings = useAppStore(s => s.updateLeagueSettings)
  const [settings, setSettings] = useState<LeagueSettings>(initialSettings)
  const [saved, setSaved] = useState(false)

  const handleToggleDay = (day: DayOfWeek) => {
    setSettings(s => ({
      ...s,
      playDays: s.playDays.includes(day) ? s.playDays.filter(d => d !== day) : [...s.playDays, day],
    }))
    setSaved(false)
  }

  const handleSave = () => {
    updateLeagueSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="card space-y-6">
      <h2 className="text-xl font-bold text-white">League Settings</h2>

      {/* Play Days */}
      <div>
        <label className="label">Recurring Play Days</label>
        <div className="space-y-2">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="flex items-center gap-3">
              <button
                onClick={() => handleToggleDay(day)}
                className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors w-32 flex-shrink-0 ${
                  settings.playDays.includes(day)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {day}
              </button>
              {settings.playDays.includes(day) && (
                <input
                  type="text"
                  value={settings.playDayTimes?.[day] ?? '20:00 – 22:00'}
                  onChange={e => setSettings(s => ({
                    ...s,
                    playDayTimes: { ...s.playDayTimes, [day]: e.target.value },
                  }))}
                  placeholder="20:00 – 22:00"
                  className="input flex-1 text-sm"
                />
              )}
            </div>
          ))}
        </div>
        {settings.playDays.length === 0 && <p className="text-xs text-orange-500 mt-2">Select at least one day</p>}
      </div>

      {/* Players per court */}
      <div>
        <label className="label">Players per Court</label>
        <input
          type="number"
          min="2"
          max="10"
          value={settings.playersPerCourt}
          onChange={e => {
            setSettings(s => ({ ...s, playersPerCourt: parseInt(e.target.value) }))
            setSaved(false)
          }}
          className="input"
        />
        <p className="text-xs text-slate-400 mt-2">
          Used to calculate required courts based on player count.
        </p>
      </div>

      {/* Minimum players */}
      <div>
        <label className="label">Minimum Players per Play Day</label>
        <input
          type="number"
          min="1"
          max="20"
          value={settings.minimumPlayers ?? 2}
          onChange={e => {
            setSettings(s => ({ ...s, minimumPlayers: parseInt(e.target.value) }))
            setSaved(false)
          }}
          className="input"
        />
        <p className="text-xs text-slate-400 mt-2">
          Play days with fewer players at the deadline will be cancelled and players credited.
        </p>
      </div>

      {/* Monthly deadline */}
      <div>
        <label className="label">Monthly Deadline (day of month)</label>
        <input
          type="number"
          min="1"
          max="31"
          value={settings.monthlyDeadline}
          onChange={e => {
            setSettings(s => ({ ...s, monthlyDeadline: parseInt(e.target.value) }))
            setSaved(false)
          }}
          className="input"
        />
        <p className="text-xs text-slate-400 mt-2">After this day, play days are locked.</p>
      </div>

      {/* Reminder day */}
      <div>
        <label className="label">Reminder Day (day of month)</label>
        <input
          type="number"
          min="1"
          max="31"
          value={settings.reminderDay}
          onChange={e => {
            setSettings(s => ({ ...s, reminderDay: parseInt(e.target.value) }))
            setSaved(false)
          }}
          className="input"
        />
        <p className="text-xs text-slate-400 mt-2">
          Players who haven't selected any play day receive a reminder.
        </p>
      </div>

      <button onClick={handleSave} className="btn-primary w-full">
        {saved ? '✓ Saved' : 'Save Settings'}
      </button>

      {saved && (
        <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-3 text-sm text-emerald-200">
          ✓ Settings saved and applied to all future months.
        </div>
      )}
    </div>
  )
}
