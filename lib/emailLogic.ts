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
      subject: `Reminder: Enter your play days for ${formatMonth(currentMonth.year, currentMonth.month)}`,
      content: `Hi ${user.name},\n\nJust a reminder — only 7 days left in the month! Please make sure your play days for ${formatMonth(currentMonth.year, currentMonth.month)} are entered.\n\nThe selection deadline is ${formatDate(currentMonth.deadlineDate)}. After this date, all play days will be locked.\n\nLog in to the app and select your games now!\n\nBest regards,\nSquash League`,
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

  const methodLabel = paymentStatus.paymentMethod === 'bank_transfer' ? 'Banküberweisung' : 'PayPal'

  let content = `Hallo ${user.name},\n\n`
  content += `wir haben Ihre Zahlungsangabe erhalten:\n\n`
  content += `Betrag: €${paymentStatus.costAmount}\n`
  content += `Monat: ${formatMonth(month.year, month.month)}\n`
  content += `Zahlungsart: ${methodLabel}\n\n`
  content += `Ihre Zahlung wird derzeit geprüft. Sobald der Eingang vom Admin bestätigt wurde, erhalten Sie eine detaillierte Bestätigungsmail mit allen Buchungsdaten.\n\n`
  content += `Mit freundlichen Grüßen,\nSquash League`

  return {
    id: `payment-receipt-${month.id}-${userId}`,
    timestamp: currentDate,
    recipient: userId,
    subject: `Zahlungseingang erfasst – ${formatMonth(month.year, month.month)}`,
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
  if (!user) {
    console.log('❌ User nicht gefunden:', userId)
    return null
  }

  const paymentStatus = month.playerStatus.get(userId)
  console.log('📧 generatePaymentConfirmationSummary:', { userId, monthId: month.id, status: paymentStatus?.status })
  if (!paymentStatus || paymentStatus.status !== 'confirmed') {
    console.log('❌ Payment status nicht confirmed:', paymentStatus?.status)
    return null
  }

  // Get the play days the user joined
  const joinedPlayDays = month.playDays.filter(pd => pd.playersJoined.includes(userId))
  const gamesCount = joinedPlayDays.length
  const baseFee = gamesCount > 0 ? 20 : 0
  const gamesFee = gamesCount * 5

  let content = `Hallo ${user.name},\n\n`
  content += `vielen Dank! Ihre Zahlung von €${paymentStatus.costAmount} für ${formatMonth(month.year, month.month)} wurde bestätigt.\n\n`

  if (joinedPlayDays.length > 0) {
    content += `=== GEBUCHTE SPIELTAGE ===\n`
    for (const playDay of joinedPlayDays) {
      content += `• ${formatDate(playDay.date)}\n`
    }
    content += `\n`
  }

  content += `=== KOSTENAUFSCHLÜSSELUNG ===\n`
  if (baseFee > 0) {
    content += `Basisgebühr: €${baseFee.toFixed(2)}\n`
    content += `Spielgebühren: ${gamesCount} × €5,00 = €${gamesFee.toFixed(2)}\n`
    content += `─────────────────────\n`
  }
  content += `Gesamtkosten: €${paymentStatus.costAmount.toFixed(2)}\n\n`

  content += `=== ZAHLUNGSINFORMATIONEN ===\n`
  content += `Zahlungsart: ${paymentStatus.paymentMethod === 'bank_transfer' ? 'Banküberweisung' : 'PayPal'}\n`
  if (paymentStatus.paymentConfirmedAt) {
    content += `Bestätigt am: ${formatDate(paymentStatus.paymentConfirmedAt)}\n`
  }

  if (paymentStatus.paymentMethod === 'bank_transfer') {
    content += `\nKontoinhaber: ${leagueSettings.bankAccountName}\n`
    content += `IBAN: ${leagueSettings.bankAccountIBAN}\n`
  } else if (paymentStatus.paymentMethod === 'paypal') {
    content += `\nPayPal Link: ${leagueSettings.paypalLink}\n`
  }

  content += `\nMit freundlichen Grüßen,\nSquash League`

  return {
    id: `payment-confirmation-${month.id}-${userId}`,
    timestamp: currentDate,
    recipient: userId,
    subject: `Zahlung bestätigt – ${formatMonth(month.year, month.month)}`,
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
