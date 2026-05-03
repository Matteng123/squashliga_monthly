import { create } from 'zustand'
import { AppState, User, LeagueSettings, Month, PlayDay, Mail, PaymentMethod, MonthPlayerStatus } from './types'
import { generateMonthsFrom, formatDate, formatMonth } from './dateUtils'
import { calculateCourtsRequired } from './courtUtils'
import { calculateCost } from './pricingUtils'
import { MOCK_USERS, DEFAULT_LEAGUE_SETTINGS } from './mockData'
import {
  checkAndGenerateEmails,
  generatePaymentConfirmationSummary,
  generatePaymentSubmittedReceipt,
} from './emailLogic'

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
  commitMonth: (monthId: string, userId: string) => void
  completeMonth: (monthId: string) => void
  setPaymentMethod: (monthId: string, userId: string, method: PaymentMethod) => void
  recordPayment: (monthId: string, userId: string) => void
  markPaymentConfirmed: (monthId: string, userId: string) => void
  autoCommitUnfinishedMonths: (monthId: string) => void
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
      const months = generateMonthsFrom(state.currentDate, 3, state.leagueSettings, state.users)
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
    const prevMonths = get().months

    set(state => {
      let months = [...state.months]

      // Ensure we have the current month
      if (!months.some(m => m.year === date.getFullYear() && m.month === date.getMonth())) {
        const newMonths = generateMonthsFrom(date, 2, state.leagueSettings, state.users)
        months = [...months, ...newMonths.filter(nm => !months.some(m => m.id === nm.id))]
      }

      // Sort and ensure we always have at least 3 ACTIVE months from current date
      months = months.sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime())

      const futureActiveMonths = months.filter(m =>
        m.status === 'active' && (
          m.year > date.getFullYear() ||
          (m.year === date.getFullYear() && m.month >= date.getMonth())
        )
      )

      if (futureActiveMonths.length < 3) {
        const lastActiveMonth = months.filter(m => m.status === 'active').pop()
        const nextStart = lastActiveMonth
          ? new Date(lastActiveMonth.year, lastActiveMonth.month + 1)
          : date
        const neededCount = 3 - futureActiveMonths.length
        const newMonths = generateMonthsFrom(nextStart, neededCount, state.leagueSettings, state.users)
        months = [...months, ...newMonths.filter(nm => !months.some(m => m.id === nm.id))]
        months = months.sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime())
      }

      const cm = computeCurrentMonth(months, date)

      // Cancel underpopulated play days at deadline
      if (cm && date >= cm.deadlineDate) {
        months = months.map(m => {
          if (m.id !== cm.id) return m
          const playerStatus = new Map(m.playerStatus)
          const updatedPlayDays = m.playDays.map(pd => {
            if (pd.status === 'cancelled') return pd
            if (pd.playersJoined.length < state.leagueSettings.minimumPlayers) {
              return { ...pd, status: 'cancelled' as const }
            }
            return pd
          })
          // Recalculate costs based on remaining non-cancelled games
          playerStatus.forEach((payment, playerId) => {
            if (['open', 'editing', 'committed', 'payment_submitted'].includes(payment.status)) {
              const remainingGames = updatedPlayDays.filter(
                pd => pd.status !== 'cancelled' && pd.playersJoined.includes(playerId)
              ).length
              const newCost = calculateCost(remainingGames)
              if (newCost !== payment.costAmount) {
                playerStatus.set(playerId, { ...payment, costAmount: newCost })
              }
            }
          })
          return { ...m, playDays: updatedPlayDays, playerStatus }
        })
      }

      const updatedCm = computeCurrentMonth(months, date)
      const nm = computeNextMonth(months, date)
      return {
        currentDate: date,
        months,
        currentMonth: updatedCm,
        nextMonth: nm,
        monthDeadlinePassed: updatedCm ? date >= updatedCm.deadlineDate : false,
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

    // Generate cancellation emails for newly cancelled play days
    const cm = updatedState.currentMonth
    if (cm && date >= cm.deadlineDate) {
      const prevCm = prevMonths.find(m => m.id === cm.id)
      // Track all refunds for the admin summary
      const refundLines: string[] = []

      for (const pd of cm.playDays) {
        if (pd.status !== 'cancelled') continue
        const prevPd = prevCm?.playDays.find(p => p.id === pd.id)
        if (prevPd?.status === 'cancelled') continue // already cancelled before, email sent

        for (const playerId of pd.playersJoined) {
          const user = updatedState.users.find(u => u.id === playerId)
          if (!user) continue
          const prevCost = prevCm?.playerStatus.get(playerId)?.costAmount ?? 0
          const newCost = cm.playerStatus.get(playerId)?.costAmount ?? 0
          const credit = prevCost - newCost

          // Player cancellation email
          const mailKey = `cancellation-${cm.id}-${pd.id}-${playerId}`
          if (!updatedState.mail.some(m => m.id === mailKey)) {
            newEmails.push({
              id: mailKey,
              timestamp: date,
              recipient: playerId,
              subject: `Play day cancelled – ${formatDate(pd.date)}`,
              content: `Hi ${user.name},\n\nUnfortunately the play day on ${formatDate(pd.date)} has been cancelled due to insufficient players (minimum: ${updatedState.leagueSettings.minimumPlayers}).\n${credit > 0 ? `\nYour monthly cost has been reduced by €${credit.toFixed(2)}. We will transfer this amount back to you.\n` : ''}\nBest regards,\nSquash League`,
              type: 'cancellation',
              monthId: cm.id,
            })
          }

          if (credit > 0) {
            refundLines.push(`• ${user.name} (${user.email}) – €${credit.toFixed(2)} – Play day: ${formatDate(pd.date)}`)
          }
        }
      }

      // Admin refund summary email (one per deadline, if there are any refunds)
      if (refundLines.length > 0) {
        const adminMailKey = `cancellation-admin-${cm.id}`
        if (!updatedState.mail.some(m => m.id === adminMailKey)) {
          const refundTotal = refundLines.length
          newEmails.push({
            id: adminMailKey,
            timestamp: date,
            recipient: 'admin',
            subject: `[Admin] Cancellation refunds – ${formatMonth(cm.year, cm.month)}`,
            content: `Hi Admin,\n\nThe following play days were cancelled this month due to insufficient players.\nPlease transfer the refunds to the players listed below.\n\n=== REFUNDS ===\n\n${refundLines.join('\n')}\n\nTotal refunds: ${refundTotal} player${refundTotal !== 1 ? 's' : ''}\n\nNote: Once player profiles are set up, PayPal.me addresses will be listed here.\n\nBest regards,\nSquash League`,
            type: 'cancellation',
            monthId: cm.id,
          })
        }
      }
    }

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
      const newMonths = generateMonthsFrom(currentDate, 3, settings, state.users)
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
          const updatedPlayDays = m.playDays.map(pd => {
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
          })

          // Calculate new games count and update cost
          const gamesJoined = updatedPlayDays.filter(pd => pd.playersJoined.includes(userId)).length
          const newCost = calculateCost(gamesJoined)

          const playerStatus = new Map(m.playerStatus)
          const currentPayment = playerStatus.get(userId)
          if (currentPayment) {
            const newStatus = (currentPayment.status === 'open' || currentPayment.status === 'editing')
              ? (gamesJoined > 0 ? 'editing' : 'open')
              : currentPayment.status
            playerStatus.set(userId, { ...currentPayment, costAmount: newCost, status: newStatus })
          }

          return {
            ...m,
            playDays: updatedPlayDays,
            playerStatus,
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
    const { currentDate } = get()
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const reminderDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), lastDay - 7)
    get().setCurrentDate(reminderDay)
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

  commitMonth: (monthId: string, userId: string) => {
    set(state => {
      const months = state.months.map(m => {
        if (m.id === monthId) {
          const playerStatus = new Map(m.playerStatus)
          const currentPayment = playerStatus.get(userId)
          if (currentPayment) {
            playerStatus.set(userId, { ...currentPayment, status: 'committed' })
          }
          return { ...m, playerStatus }
        }
        return m
      })
      return { months }
    })
  },

  completeMonth: (monthId: string) => {
    set(state => {
      const months = state.months.map(m => {
        if (m.id === monthId) {
          const playerStatus = new Map(m.playerStatus)
          playerStatus.forEach((payment, playerId) => {
            if (payment.status === 'committed' || payment.status === 'payment_submitted') {
              playerStatus.set(playerId, { ...payment, status: 'unpaid' })
            }
          })
          return { ...m, status: 'archived' as const, playerStatus }
        }
        return m
      })
      return { months }
    })
  },

  setPaymentMethod: (monthId: string, userId: string, method: PaymentMethod) => {
    set(state => {
      const months = state.months.map(m => {
        if (m.id === monthId) {
          const playerStatus = new Map(m.playerStatus)
          const currentPayment = playerStatus.get(userId)
          if (currentPayment) {
            playerStatus.set(userId, { ...currentPayment, paymentMethod: method, status: 'payment_submitted' })
          }
          return { ...m, playerStatus }
        }
        return m
      })

      // Generate payment receipt email for the player
      const updatedMonth = months.find(m => m.id === monthId)
      if (updatedMonth) {
        const receiptEmail = generatePaymentSubmittedReceipt(
          state.currentDate,
          updatedMonth,
          userId,
          state.users,
        )
        if (receiptEmail) {
          return { months, mail: [...state.mail, receiptEmail] }
        }
      }

      return { months }
    })
    get()._computeRecentMail()
  },

  recordPayment: (monthId: string, userId: string) => {
    set(state => {
      const months = state.months.map(m => {
        if (m.id === monthId) {
          const playerStatus = new Map(m.playerStatus)
          const currentPayment = playerStatus.get(userId)
          if (currentPayment) {
            playerStatus.set(userId, { ...currentPayment, status: 'payment_submitted', paymentRecordedAt: new Date() })
          }
          return { ...m, playerStatus }
        }
        return m
      })
      return { months }
    })
  },

  markPaymentConfirmed: (monthId: string, userId: string) => {
    console.log('🔔 markPaymentConfirmed called:', { monthId, userId })
    set(state => {
      const months = state.months.map(m => {
        if (m.id === monthId) {
          const playerStatus = new Map(m.playerStatus)
          const currentPayment = playerStatus.get(userId)
          // Ensure user exists in map, update status to 'confirmed'
          playerStatus.set(userId, {
            ...(currentPayment || { playerId: userId, status: 'open', costAmount: 0 }),
            status: 'confirmed',
            paymentConfirmedAt: state.currentDate,
          })
          return { ...m, playerStatus }
        }
        return m
      })

      const updatedMonth = months.find(m => m.id === monthId)
      if (updatedMonth) {
        console.log('✅ Updated month found, generating email...')
        const confirmationEmail = generatePaymentConfirmationSummary(
          state.currentDate,
          updatedMonth,
          userId,
          state.users,
          state.leagueSettings,
        )

        if (confirmationEmail) {
          console.log('✉️ Email generated successfully, adding to mail...')
          return { months, mail: [...state.mail, confirmationEmail] }
        } else {
          console.log('❌ Email generation returned null')
        }
      }

      return { months }
    })
    get()._computeRecentMail()
  },

  autoCommitUnfinishedMonths: (monthId: string) => {
    set(state => {
      const months = state.months.map(m => {
        if (m.id === monthId) {
          const playerStatus = new Map(m.playerStatus)
          playerStatus.forEach((payment, playerId) => {
            if (payment.status === 'open') {
              playerStatus.set(playerId, { ...payment, status: 'committed' })
            }
          })
          return { ...m, playerStatus }
        }
        return m
      })
      return { months }
    })
  },
}))

export default useAppStore
