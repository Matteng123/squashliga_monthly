export const en = {
  // Common
  common: {
    player: 'Player',
    admin: 'Admin',
    selectRole: 'Select Role',
    switchRole: 'Switch Role',
    logout: 'Logout',
    loading: 'Loading...',
    today: 'Today',
    month: 'Month',
    months: 'Months',
    game: 'Game',
    games: 'Games',
    games_short: 'G',
    court: 'Court',
    courts: 'Courts',
    cost: 'Cost',
    price: 'Price',
    players: 'Players',
    deadline: 'Deadline',
    status: 'Status',
    action: 'Action',
    joined: 'Joined',
    join: 'Join',
    withdraw: 'Withdraw',
    open: '✓ Open',
    locked: '🔒 Locked',
  },

  // Header
  header: {
    title: '🏸 Squash League',
    mailCenter: 'Mail Center',
    version: 'Prototype',
    noRealAuth: 'This is a prototype. No real authentication or data persistence.',
  },

  // Role Selection
  roleSelector: {
    title: '🏸 Squash League',
    subtitle: 'Monthly casual league management',
    playerTitle: 'Player',
    playerSubtitle: 'Join play days • Track costs • View schedule',
    adminTitle: 'Admin',
    adminSubtitle: 'Configure league • View participation • Review emails',
  },

  // Player Dashboard
  player: {
    selectionOpen: '✓ Selection open – join or leave play days.',
    selectionLocked: '🔒 This month is locked – no further changes possible.',
    playDaysTitle: 'Play Days',
    noPlayDays: 'No play days scheduled for this month.',
    open: 'Open',
    locked: 'Locked',
    joined: '✓ Joined',
    join: '+ Join',
    playersJoined: 'Players',
    tip: '💡 Tip: Join games to see your costs updated below.',
    baseFeeTip: 'If you book at least one game: €20 base fee + €5 per game. No selection = €0.',
    mailCenter: '📬 Mail Center',
  },

  // Month Selector
  monthSelector: {
    selectMonth: 'Select Month',
    previousMonth: 'Previous Month',
    nextMonth: 'Next Month',
  },

  // Payment
  payments: {
    paymentSummary: 'Payment Summary',
    baseFee: 'Base Fee',
    gamesFee: 'Games Fee',
    totalCost: 'Total Cost',
    status: 'Status',
    paymentStatus: 'Payment Status',
    openStatus: 'Open',
    editingStatus: 'Editing',
    committedStatus: 'Committed',
    paymentSubmittedStatus: 'Pending Review',
    confirmedStatus: 'Confirmed',
    unpaidStatus: 'Unpaid',
    paidStatus: 'Paid',
    commitMonth: 'Commit Month',
    payMonth: 'Pay Month',
    selectPaymentMethod: 'Select Payment Method',
    choosePaymentMethod: 'How would you like to pay?',
    bankTransfer: 'Bank Transfer',
    bankTransferDesc: 'Direct bank transfer',
    paypal: 'PayPal',
    paypalDesc: 'Payment via PayPal',
    confirm: 'Confirm',
    cancel: 'Cancel',
    paymentSubmitted: '✓ Payment method entered – waiting for admin confirmation',
    paymentConfirmed: '✓ Payment confirmed',
    markConfirmed: 'Confirm',
    paymentDue: 'Payment Due',
    paymentConfirmation: 'Payment Confirmation',
    paymentInfo: 'Payment Information',
    bankDetails: 'Bank Details',
    accountName: 'Account Holder',
    iban: 'IBAN',
    transferInstructions: 'Please transfer the amount to the following account:',
    paypalInstructions: 'Pay via PayPal by clicking the button below:',
    openPayPal: 'Open PayPal',
    accountNameLabel: 'Account Holder',
    ibanLabel: 'IBAN',
    paypalLinkLabel: 'PayPal Link',
    payPerPayPal: 'Pay via PayPal',
  },

  // Admin Dashboard
  admin: {
    leagueSettingsTitle: 'League Settings',
    monthlyOverview: 'Monthly Overview',
    paymentStatus: 'Payment Status',
    timeControls: 'Time Simulation',
    current: 'Current',
    completed: '✓ Completed',
    completeMonth: 'Complete Month',
    monthCompleted: '✓ This month has been completed',
    uniquePlayers: 'Unique Players',
    totalSlots: 'Total Slots',
    deadlinePassed: '🔒 Deadline passed – emails sent',
    tips: '💡 Admin Tips:',
    tip1: '✓ Configure league settings (play days, court size, deadlines)',
    tip2: '✓ Use time simulation to trigger deadlines and emails',
    tip3: '✓ Check the Mail Center to see generated emails',
    tip4: '✓ Settings apply to all future months when saved',
  },

  // League Settings
  leagueSettings: {
    title: 'League Settings',
    playDays: 'Play Days',
    playersPerCourt: 'Players per Court',
    monthlyDeadline: 'Monthly Deadline (day of month)',
    reminderDay: 'Reminder Day (day of month)',
    save: 'Save',
    saved: 'Saved!',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },

  // Mail Center
  mail: {
    title: '📬 Mail Center',
    subtitle: 'Simulated emails from the league system. The last 3 months are shown.',
    aboutSystemEmails: '💡 About system emails:',
    reminderEmail: 'Reminder: Sent 7 days before month end to all players and admins.',
    adminSummaryEmail: 'Admin Summary: Sent immediately after the deadline with full participation details.',
    bookingEmail: 'Booking Email: Clean format ready to forward to Cosmo Sport.',
    paymentReminderEmail: 'Payment Reminder: Sent when a player has committed to pay.',
    paymentConfirmationEmail: 'Payment Confirmation: Sent when the admin confirms a payment.',
    back: '← Back',
  },

  // Time Simulation
  timeSimulation: {
    title: 'Time Simulation',
    currentDate: 'Current Date',
    jumpToDeadline: 'Jump to Deadline',
    jumpToReminderDay: 'Jump to Reminder Day',
    dateFormat: 'DD.MM.YYYY',
  },

  // Email Types
  emailTypes: {
    reminder: 'Play Day Reminder',
    adminSummary: 'Admin Summary',
    booking: 'Booking Email',
    paymentReminder: 'Payment Reminder',
    paymentConfirmation: 'Payment Confirmation',
    cancellation: 'Play Day Cancellation',
  },

  // Emails
  emails: {
    reminderSubject: (month: string) => `Reminder: Enter your play days for ${month}`,
    reminderContent: (playerName: string, month: string, deadlineDate: string) =>
      `Hi ${playerName},\n\nJust a reminder — only 7 days left in the month! Please make sure your play days for ${month} are entered.\n\nThe selection deadline is ${deadlineDate}. After this date, all play days will be locked.\n\nLog in to the app and select your games now!\n\nBest regards,\nSquash League`,

    adminSummarySubject: (month: string) => `[Admin] Monthly Summary – ${month}`,
    adminSummaryContent: (month: string, deadline: string, content: string, totalPlayers: number, totalSlots: number) =>
      `Monthly League Summary – ${month}\n\nDeadline: ${deadline}\n\n=== PLAY DAYS ===\n\n${content}\n=== TOTALS ===\nUnique players: ${totalPlayers}\nTotal session slots: ${totalSlots}\n\nPlease forward the booking details below to Cosmo Sport.\n\nBest regards,\nSquash League`,

    bookingSubject: (month: string) => `[Booking] Cosmo Sport – ${month}`,
    bookingContent: (content: string) =>
      `=== BOOKING INFORMATION ===\n\n${content}\n---\nPlease forward this to Cosmo Sport for court booking.\nGenerated: ${new Date().toISOString()}`,

    paymentReminderSubject: (month: string) => `Payment due for ${month}`,
    paymentReminderContent: (playerName: string, month: string, cost: number) =>
      `Hi ${playerName},\n\nYou have committed to pay €${cost} for ${month}.\n\nPlease record your payment in the app now.\n\nBest regards,\nSquash League`,

    paymentConfirmationSubject: (month: string) => `Payment confirmed for ${month}`,
    paymentConfirmationContent: (playerName: string, cost: number) =>
      `Hi ${playerName},\n\nWe have received your payment of €${cost}.\n\nThank you for participating in the Squash League!\n\nBest regards,\nSquash League`,
  },
}

export const de = en
