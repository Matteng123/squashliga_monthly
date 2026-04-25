import { Mail, Month, User } from './types'
import { isReminderDay, isDeadlinePassed, formatDate, formatMonth } from './dateUtils'
import { calculateCourtsRequired } from './courtUtils'

export function generateReminders(
  currentDate: Date,
  nextMonth: Month | undefined,
  users: User[],
  existingMail: Mail[],
): Mail[] {
  const newMails: Mail[] = []

  if (!nextMonth) return newMails

  if (!isReminderDay(currentDate, nextMonth.reminderDate)) return newMails

  const reminderKey = `reminder-${nextMonth.id}`
  if (existingMail.some(m => m.id === reminderKey)) return newMails

  const players = users.filter(u => u.role === 'player')

  for (const player of players) {
    const hasSelection = nextMonth.playDays.some(pd => pd.playersJoined.includes(player.id))
    if (!hasSelection) {
      newMails.push({
        id: `${reminderKey}-${player.id}`,
        timestamp: currentDate,
        recipient: player.id,
        subject: `Don't forget: Select your play days for ${formatMonth(nextMonth.year, nextMonth.month)}`,
        content: `Hi ${player.name},\n\nThis is a friendly reminder to select your play days for ${formatMonth(
          nextMonth.year,
          nextMonth.month,
        )}.\n\nThe selection deadline is ${formatDate(nextMonth.deadlineDate)}. After this date, all play days will be locked and you won't be able to make changes.\n\nLog in to the app and select your games now!\n\nBest regards,\nSquash League`,
        type: 'reminder',
        monthId: nextMonth.id,
      })
    }
  }

  return newMails
}

export function generateAdminSummaries(
  currentDate: Date,
  currentMonth: Month | undefined,
  existingMail: Mail[],
): Mail[] {
  const newMails: Mail[] = []

  if (!currentMonth) return newMails

  if (!isDeadlinePassed(currentDate, currentMonth.deadlineDate)) return newMails

  const summaryKey = `admin-summary-${currentMonth.id}`
  if (existingMail.some(m => m.id === summaryKey)) return newMails

  let content = `Monthly League Summary – ${formatMonth(currentMonth.year, currentMonth.month)}\n\n`
  content += `Deadline: ${formatDate(currentMonth.deadlineDate)}\n\n`
  content += `=== PLAY DAYS ===\n\n`

  for (const playDay of currentMonth.playDays) {
    const playerCount = playDay.playersJoined.length
    const courts = calculateCourtsRequired(playerCount, 4)
    content += `${formatDate(playDay.date)}\n`
    content += `Players: ${playerCount}\n`
    content += `Courts needed: ${courts}\n\n`
  }

  content += `=== TOTALS ===\n`
  const totalPlayers = new Set(currentMonth.playDays.flatMap(pd => pd.playersJoined)).size
  const totalSessionSlots = currentMonth.playDays.reduce((sum, pd) => sum + pd.playersJoined.length, 0)
  content += `Unique players: ${totalPlayers}\n`
  content += `Total session slots filled: ${totalSessionSlots}\n\n`
  content += `Please forward the booking details (below) to Cosmo Sport.\n\nBest regards,\nSquash League`

  newMails.push({
    id: summaryKey,
    timestamp: currentDate,
    recipient: 'admin',
    subject: `[Admin] Monthly Summary – ${formatMonth(currentMonth.year, currentMonth.month)}`,
    content,
    type: 'admin_summary',
    monthId: currentMonth.id,
  })

  return newMails
}

export function generateBookingEmails(
  currentDate: Date,
  currentMonth: Month | undefined,
  existingMail: Mail[],
): Mail[] {
  const newMails: Mail[] = []

  if (!currentMonth) return newMails

  if (!isDeadlinePassed(currentDate, currentMonth.deadlineDate)) return newMails

  const bookingKey = `booking-${currentMonth.id}`
  if (existingMail.some(m => m.id === bookingKey)) return newMails

  let content = `=== BOOKING INFORMATION ===\n`
  content += `Month: ${formatMonth(currentMonth.year, currentMonth.month)}\n\n`

  for (const playDay of currentMonth.playDays) {
    const playerCount = playDay.playersJoined.length
    if (playerCount === 0) continue
    const courts = calculateCourtsRequired(playerCount, 4)
    content += `Date: ${formatDate(playDay.date)}\n`
    content += `Players: ${playerCount}\n`
    content += `Courts needed: ${courts}\n\n`
  }

  content += `---\n`
  content += `Please forward this to Cosmo Sport for court booking.\n`
  content += `Generated: ${new Date().toISOString()}`

  newMails.push({
    id: bookingKey,
    timestamp: currentDate,
    recipient: 'admin',
    subject: `[Booking] Cosmo Sport – ${formatMonth(currentMonth.year, currentMonth.month)}`,
    content,
    type: 'booking',
    monthId: currentMonth.id,
  })

  return newMails
}

export function checkAndGenerateEmails(
  currentDate: Date,
  currentMonth: Month | undefined,
  nextMonth: Month | undefined,
  users: User[],
  existingMail: Mail[],
): Mail[] {
  const newMails: Mail[] = []

  newMails.push(...generateReminders(currentDate, nextMonth, users, existingMail))
  newMails.push(...generateAdminSummaries(currentDate, currentMonth, existingMail))
  newMails.push(...generateBookingEmails(currentDate, currentMonth, existingMail))

  return newMails
}
