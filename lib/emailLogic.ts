import { Mail, Month, User, LeagueSettings } from './types'
import { isReminderDay, isDeadlinePassed, formatDate, formatMonth } from './dateUtils'
import { calculateCourtsRequired } from './courtUtils'

function isSevenDaysBeforeMonthEnd(date: Date): boolean {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return lastDay - date.getDate() === 7
}

export function generateReminders(
  currentDate: Date,
  currentMonth: Month | undefined,
  users: User[],
  existingMail: Mail[],
): Mail[] {
  const newMails: Mail[] = []

  if (!currentMonth) return newMails
  if (!isSevenDaysBeforeMonthEnd(currentDate)) return newMails

  const reminderKey = `reminder-${currentMonth.id}`
  if (existingMail.some(m => m.id.startsWith(reminderKey))) return newMails

  for (const user of users) {
    newMails.push({
      id: `${reminderKey}-${user.id}`,
      timestamp: currentDate,
      recipient: user.id,
      subject: `Reminder: 7 days left to sign up and pay for ${formatMonth(currentMonth.year, currentMonth.month)}`,
      content: `Hi ${user.name},\n\nYou have 7 days left to:\n\n1. Select your play days for ${formatMonth(currentMonth.year, currentMonth.month)}\n2. Complete your payment\n\nThe deadline is ${formatDate(currentMonth.deadlineDate)}. After this date, all play days will be locked and no further changes are possible.\n\nLog in to the app now!\n\nBest regards,\nSquash League`,
      type: 'reminder',
      monthId: currentMonth.id,
    })
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

export function generatePaymentReminders(
  currentDate: Date,
  currentMonth: Month | undefined,
  users: User[],
  existingMail: Mail[],
): Mail[] {
  const newMails: Mail[] = []

  if (!currentMonth) return newMails

  if (!isDeadlinePassed(currentDate, currentMonth.deadlineDate)) return newMails

  const players = users.filter(u => u.role === 'player')

  for (const player of players) {
    const paymentStatus = currentMonth.playerStatus.get(player.id)
    if (!paymentStatus || paymentStatus.status !== 'committed') continue

    const paymentReminderKey = `payment-reminder-${currentMonth.id}-${player.id}`
    if (existingMail.some(m => m.id === paymentReminderKey)) continue

    newMails.push({
      id: paymentReminderKey,
      timestamp: currentDate,
      recipient: player.id,
      subject: `Payment due for ${formatMonth(currentMonth.year, currentMonth.month)}`,
      content: `Hi ${player.name},\n\nYou have committed to pay €${paymentStatus.costAmount} for ${formatMonth(
        currentMonth.year,
        currentMonth.month,
      )}.\n\nPlease record your payment in the app now.\n\nBest regards,\nSquash League`,
      type: 'payment_reminder',
      monthId: currentMonth.id,
    })
  }

  return newMails
}

export function generatePaymentSubmittedReceipt(
  currentDate: Date,
  month: Month,
  userId: string,
  users: User[],
): Mail | null {
  const user = users.find(u => u.id === userId)
  if (!user) return null

  const paymentStatus = month.playerStatus.get(userId)
  if (!paymentStatus || paymentStatus.status !== 'payment_submitted') return null

  const methodLabel = paymentStatus.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'PayPal'

  let content = `Hi ${user.name},\n\n`
  content += `We have received your payment details:\n\n`
  content += `Amount: €${paymentStatus.costAmount}\n`
  content += `Month: ${formatMonth(month.year, month.month)}\n`
  content += `Payment method: ${methodLabel}\n\n`
  content += `Your payment is currently being reviewed. Once confirmed by the admin, you will receive a detailed confirmation email.\n\n`
  content += `Best regards,\nSquash League`

  return {
    id: `payment-receipt-${month.id}-${userId}`,
    timestamp: currentDate,
    recipient: userId,
    subject: `Payment received – ${formatMonth(month.year, month.month)}`,
    content,
    type: 'payment_confirmation',
    monthId: month.id,
  }
}

export function generatePaymentConfirmationSummary(
  currentDate: Date,
  month: Month,
  userId: string,
  users: User[],
  leagueSettings: LeagueSettings,
): Mail | null {
  const user = users.find(u => u.id === userId)
  if (!user) return null

  const paymentStatus = month.playerStatus.get(userId)
  if (!paymentStatus || paymentStatus.status !== 'confirmed') return null

  const joinedPlayDays = month.playDays.filter(pd => pd.playersJoined.includes(userId))
  const gamesCount = joinedPlayDays.length
  const baseFee = gamesCount > 0 ? 20 : 0
  const gamesFee = gamesCount * 5

  let content = `Hi ${user.name},\n\n`
  content += `Thank you! Your payment of €${paymentStatus.costAmount} for ${formatMonth(month.year, month.month)} has been confirmed.\n\n`

  if (joinedPlayDays.length > 0) {
    content += `=== BOOKED PLAY DAYS ===\n`
    for (const playDay of joinedPlayDays) {
      content += `• ${formatDate(playDay.date)}\n`
    }
    content += `\n`
  }

  content += `=== COST BREAKDOWN ===\n`
  if (baseFee > 0) {
    content += `Base fee: €${baseFee.toFixed(2)}\n`
    content += `Games fee: ${gamesCount} × €5.00 = €${gamesFee.toFixed(2)}\n`
    content += `─────────────────────\n`
  }
  content += `Total: €${paymentStatus.costAmount.toFixed(2)}\n\n`

  content += `=== PAYMENT DETAILS ===\n`
  content += `Method: ${paymentStatus.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'PayPal'}\n`
  if (paymentStatus.paymentConfirmedAt) {
    content += `Confirmed on: ${formatDate(paymentStatus.paymentConfirmedAt)}\n`
  }

  if (paymentStatus.paymentMethod === 'bank_transfer') {
    content += `\nAccount holder: ${leagueSettings.bankAccountName}\n`
    content += `IBAN: ${leagueSettings.bankAccountIBAN}\n`
  } else if (paymentStatus.paymentMethod === 'paypal') {
    content += `\nPayPal link: ${leagueSettings.paypalLink}\n`
  }

  content += `\nBest regards,\nSquash League`

  return {
    id: `payment-confirmation-${month.id}-${userId}`,
    timestamp: currentDate,
    recipient: userId,
    subject: `Payment confirmed – ${formatMonth(month.year, month.month)}`,
    content,
    type: 'payment_confirmation',
    monthId: month.id,
  }
}

export function checkAndGenerateEmails(
  currentDate: Date,
  currentMonth: Month | undefined,
  nextMonth: Month | undefined,
  users: User[],
  existingMail: Mail[],
): Mail[] {
  const newMails: Mail[] = []

  newMails.push(...generateReminders(currentDate, currentMonth, users, existingMail))
  newMails.push(...generateAdminSummaries(currentDate, currentMonth, existingMail))
  newMails.push(...generateBookingEmails(currentDate, currentMonth, existingMail))
  newMails.push(...generatePaymentReminders(currentDate, currentMonth, users, existingMail))

  return newMails
}
