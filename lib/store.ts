import { create } from 'zustand'
import { AppState, User, LeagueSettings, Month, PlayDay, Mail } from './types'
import { generateMonthsFrom, formatDate } from './dateUtils'
import { calculateCourtsRequired } from './courtUtils'
import { MOCK_USERS, DEFAULT_LEAGUE_SETTINGS } from './mockData'
import { checkAndGenerateEmails } from './emailLogic'

interface Store extends AppState {
  // Computed (store in state, not getter)
  currentMonth: Month | null
  nextMonth: Month | null
  monthDeadlinePassed: boolean
  recentMail: Mail[]

  // Actions
  initApp: () => void
  setCurrentDate: (date: Date) => void
  setCurrentUser: (userId: string | null) => void
  updateLeagueSettings: (settings: LeagueSettings) => void
  togglePlayDay: (monthId: string, playDayId: string) => void
  jumpToDeadline: () => void
  jumpToReminderDay: () => void
  switchRole: () => void
  updateMonth: (monthId: string, playDays: PlayDay[]) => void
  markMailAsRead: (mailId: string) => void
  _computeCurrentMonth: () => void
  _computeNextMonth: () => void
  _computeRecentMail: () => void
}

const computeCurrentMonth = (months: Month[], currentDate: Date) => {
  return months.find(
    m => m.year === currentDate.getFullYear() && m.month === currentDate.getMonth(),
  ) || null
}

const computeNextMonth = (months: Month[], currentDate: Date) => {
  const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
  return months.find(m => m.year === nextDate.getFullYear() && m.month === nextDate.getMonth()) ||
    null
}

const computeRecentMail = (mail: Mail[]) => {
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  return mail.filter(m => m.timestamp >= threeMonthsAgo).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

const useAppStore = create<Store>((set, get) => ({
  // Initial state
  users: MOCK_USERS,
  currentDate: new Date(2026, 4, 1),
  leagueSettings: DEFAULT_LEAGUE_SETTINGS,
  months: [],
  mail: [],
  currentUserId: null,
  currentUser: null,
  emailsSentThisMonth: {},
  currentMonth: null,
  nextMonth: null,
  monthDeadlinePassed: false,
  recentMail: [],

  _computeCurrentMonth: () => {
    set(state => {
      const cm = computeCurrentMonth(state.months, state.currentDate)
      return { currentMonth: cm, monthDeadlinePassed: cm ? state.currentDate >= cm.deadlineDate : false }
    })
  },

  _computeNextMonth: () => {
    set(state => {
      const nm = computeNextMonth(state.months, state.currentDate)
      return { nextMonth: nm }
    })
  },

  _computeRecentMail: () => {
    set(state => ({
      recentMail: computeRecentMail(state.mail)
    }))
  },

  initApp: () => {
    set(state => {
      const months = generateMonthsFrom(state.currentDate, 4, state.leagueSettings)
      const cm = computeCurrentMonth(months, state.currentDate)
      const nm = computeNextMonth(months, state.currentDate)
      return {
        months,
        currentMonth: cm,
        nextMonth: nm,
        monthDeadlinePassed: cm ? state.currentDate >= cm.deadlineDate : false,
      }
    })
  },

  setCurrentDate: (date: Date) => {
    set(state => {
      let months = state.months

      if (!months.some(m => m.year === date.getFullYear() && m.month === date.getMonth())) {
        months = [...months, ...generateMonthsFrom(date, 2, state.leagueSettings)].sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime())
      }

      const cm = computeCurrentMonth(months, date)
      const nm = computeNextMonth(months, date)
      return {
        currentDate: date,
        months,
        currentMonth: cm,
        nextMonth: nm,
        monthDeadlinePassed: cm ? date >= cm.deadlineDate : false,
      }
    })

    const updatedState = get()
    const newEmails = checkAndGenerateEmails(
      date,
      updatedState.currentMonth || undefined,
      updatedState.nextMonth || undefined,
      updatedState.users,
      updatedState.mail,
    )

    if (newEmails.length > 0) {
      set(state => ({
        mail: [...state.mail, ...newEmails],
      }))
      get()._computeRecentMail()
    }
  },

  setCurrentUser: (userId: string | null) => {
    set(state => {
      const user = userId ? state.users.find(u => u.id === userId) || null : null
      return { currentUserId: userId, currentUser: user }
    })
  },

  updateLeagueSettings: (settings: LeagueSettings) => {
    set(state => {
      const currentDate = state.currentDate
      const newMonths = generateMonthsFrom(currentDate, 4, settings)
      const cm = computeCurrentMonth(newMonths, currentDate)
      const nm = computeNextMonth(newMonths, currentDate)

      return {
        leagueSettings: settings,
        months: newMonths,
        currentMonth: cm,
        nextMonth: nm,
        monthDeadlinePassed: cm ? currentDate >= cm.deadlineDate : false,
      }
    })
  },

  togglePlayDay: (monthId: string, playDayId: string) => {
    set(state => {
      const userId = state.currentUserId
      if (!userId) return state

      const months = state.months.map(m => {
        if (m.id === monthId && !m.playDays.some(pd => state.currentDate >= m.deadlineDate)) {
          return {
            ...m,
            playDays: m.playDays.map(pd => {
              if (pd.id === playDayId) {
                const isJoined = pd.playersJoined.includes(userId)
                const newPlayersJoined = isJoined
                  ? pd.playersJoined.filter(id => id !== userId)
                  : [...pd.playersJoined, userId]

                const courtsRequired = calculateCourtsRequired(
                  newPlayersJoined.length,
                  state.leagueSettings.playersPerCourt,
                )

                return {
                  ...pd,
                  playersJoined: newPlayersJoined,
                  courtsRequired,
                }
              }
              return {
                ...pd,
                courtsRequired: calculateCourtsRequired(
                  pd.playersJoined.length,
                  state.leagueSettings.playersPerCourt,
                ),
              }
            }),
          }
        }
        return m
      })

      return { months }
    })
  },

  updateMonth: (monthId: string, playDays: PlayDay[]) => {
    set(state => ({
      months: state.months.map(m => (m.id === monthId ? { ...m, playDays } : m)),
    }))
  },

  jumpToDeadline: () => {
    const { currentMonth } = get()
    if (currentMonth) {
      get().setCurrentDate(currentMonth.deadlineDate)
    }
  },

  jumpToReminderDay: () => {
    const { nextMonth } = get()
    if (nextMonth) {
      get().setCurrentDate(nextMonth.reminderDate)
    }
  },

  switchRole: () => {
    const { currentUser, users } = get()
    if (!currentUser) return

    const nextRole = currentUser.role === 'player' ? 'admin' : 'player'
    const nextUser = users.find(u => u.role === nextRole)

    if (nextUser) {
      get().setCurrentUser(nextUser.id)
    }
  },

  markMailAsRead: (mailId: string) => {
    set(state => ({
      mail: state.mail.filter(m => m.id !== mailId),
    }))
    get()._computeRecentMail()
  },
}))

export default useAppStore
