import { DayOfWeek, Month, PlayDay } from './types'
import { LeagueSettings } from './types'

const DAY_OF_WEEK_MAP: { [key: number]: DayOfWeek } = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

const DAY_OF_WEEK_INDEX: { [key in DayOfWeek]: number } = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

export function getDayOfWeek(date: Date): DayOfWeek {
  return DAY_OF_WEEK_MAP[date.getDay()]
}

export function isTargetDay(date: Date, targetDay: DayOfWeek): boolean {
  return getDayOfWeek(date) === targetDay
}

export function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function generateMonthsFrom(startDate: Date, count: number, settings: LeagueSettings, users: any[] = []): Month[] {
  const months: Month[] = []
  const startYear = startDate.getFullYear()
  const startMonth = startDate.getMonth()

  for (let i = 0; i < count; i++) {
    const year = startYear + Math.floor((startMonth + i) / 12)
    const month = (startMonth + i) % 12
    const monthId = `${year}-${String(month + 1).padStart(2, '0')}`

    const playDays = generatePlayDaysForMonth(year, month, settings)
    const deadlineDate = new Date(year, month, settings.monthlyDeadline)
    const reminderDate = new Date(year, month, settings.reminderDay)
    const commitmentDeadline = new Date(year, month, settings.monthlyDeadline + 2)

    const playerStatus = new Map()
    users.forEach(user => {
      playerStatus.set(user.id, {
        playerId: user.id,
        status: 'editing',
        costAmount: 20,
      })
    })

    months.push({
      id: monthId,
      year,
      month,
      playDays,
      playerStatus,
      status: 'active',
      deadlineDate,
      reminderDate,
      commitmentDeadline,
    })
  }

  return months
}

function generatePlayDaysForMonth(year: number, month: number, settings: LeagueSettings): PlayDay[] {
  const playDays: PlayDay[] = []
  const daysInMonth = getLastDayOfMonth(year, month)

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayOfWeek = getDayOfWeek(date)

    if (settings.playDays.includes(dayOfWeek)) {
      const playDayId = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      playDays.push({
        id: playDayId,
        date,
        dayOfWeek,
        playersJoined: [],
        status: 'open',
        courtsRequired: 0,
      })
    }
  }

  return playDays
}

export function isDeadlinePassed(currentDate: Date, deadlineDate: Date): boolean {
  return currentDate >= deadlineDate
}

export function isReminderDay(currentDate: Date, reminderDate: Date): boolean {
  return (
    currentDate.getFullYear() === reminderDate.getFullYear() &&
    currentDate.getMonth() === reminderDate.getMonth() &&
    currentDate.getDate() === reminderDate.getDate()
  )
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatMonth(year: number, month: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month))
}

export function getMonthsBetween(start: Date, end: Date): { year: number; month: number }[] {
  const months = []
  let current = new Date(start)

  while (current <= end) {
    months.push({
      year: current.getFullYear(),
      month: current.getMonth(),
    })
    current.setMonth(current.getMonth() + 1)
  }

  return months
}
